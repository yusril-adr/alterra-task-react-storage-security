// Library
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useSubscription, useMutation, useLazyQuery } from '@apollo/client';
import Swal from 'sweetalert2';

// MUI Components
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import LogoutIcon from '@mui/icons-material/Logout';

// Assets
import './style.css';

// Components
import Loading from '../../components/Loading';
import Todo from '../../components/Todo';

// Apollo Helpers
import Query from '../../services/apollo/todos/query';
import Mutation from '../../services/apollo/todos/mutation';
import Subscription from '../../services/apollo/todos/subscription';

// Utils
import TokenManager from '../../utils/TokenManager';

const List = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentShownId, setCurrentShownId] = useState(null);

  const [cookies, setCookie, removeCookie] = useCookies([process.env.REACT_APP_COOKIE_KEY]);

  const checkLoginStatus = async () => {
    const token = localStorage.getItem(process.env.REACT_APP_LOCAL_STORAGE_KEY);

    if (!cookies[process.env.REACT_APP_COOKIE_KEY] && !token) navigate('/');

    try {
      const userId = token
        ? TokenManager.verifyToken(token).id : cookies[process.env.REACT_APP_COOKIE_KEY];
      // eslint-disable-next-line no-console
      console.log(userId);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message,
      });
      navigate('/');
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const {
    loading: fetchLoading,
    error: fetchError, data,
  } = useSubscription(Subscription.subsTodoList);

  const [addTodo, { error: addTodoError, loading: addTodoLoading }] = useMutation(Mutation.addTodo);

  const [updateTodoCompletedStatus,
    {
      error: updateTodoError,
      loading: updateTodoLoading,
    },
  ] = useMutation(Mutation.updateTodoCompletedStatus, {
    refetchQueries: [
      {
        query: Query.getTodoById,
        variables: { id: currentShownId },
      },
    ],
  });

  const [deleteTodoByid,
    { error: deleteTodoError, loading: deleteTodoLoading },
  ] = useMutation(Mutation.deleteTodoById, {
    refetchQueries: [
      {
        query: Query.getTodoById,
        variables: { id: currentShownId },
      },
    ],
  });

  const [getTodoById,
    { loading: searchLoading, error: searchError, data: searchData },
  ] = useLazyQuery(Query.getTodoById);

  const onChangeTitle = (e) => {
    if (e.target) {
      setTitle(e.target.value);
    }
  };

  const onSubmitList = (e) => {
    e.preventDefault();
    addTodo({ variables: { title } });
    setTitle('');
  };

  const onClickItem = (id) => {
    const { completed } = data.list.find((todo) => todo.id === id);
    updateTodoCompletedStatus({ variables: { id, completed: !completed } });
  };

  const onDeleteItem = (id) => {
    deleteTodoByid({ variables: { id } });
  };

  const onChangeSearcInput = (e) => {
    if (e.target.value) {
      setSearchInput(e.target.value);
    }
  };

  const onSearchList = (e) => {
    e.preventDefault();
    if (searchInput.trim() !== '') {
      getTodoById({ variables: { id: searchInput } });
      setCurrentShownId(searchInput);
      setSearchInput('');
    }
  };

  const logOutHandler = () => {
    const token = localStorage.getItem(process.env.REACT_APP_LOCAL_STORAGE_KEY);
    const cookie = cookies[process.env.REACT_APP_COOKIE_KEY];

    if (token) {
      localStorage.removeItem(process.env.REACT_APP_LOCAL_STORAGE_KEY);
    }

    if (cookie) {
      removeCookie(process.env.REACT_APP_COOKIE_KEY);
    }

    navigate('/');
  };

  if (fetchLoading || addTodoLoading || updateTodoLoading || deleteTodoLoading || searchLoading) {
    return (<Loading />);
  }

  if (fetchError || addTodoError || updateTodoError || deleteTodoError || searchError) {
    // eslint-disable-next-line no-alert
    alert(
      fetchError.message
      || addTodoError.message
      || updateTodoError.message
      || deleteTodoError.message
      || searchError.message,
    );
  }

  return (
    <div className="container">
      <h1 className="app-title">todos</h1>

      <ul className="todo-list js-todo-list">
        {data?.list.map(({ id, title: todoTitle, completed }) => (
          <Todo
            key={id}
            id={id}
            onClickItem={() => onClickItem(id)}
            onDeleteItem={() => onDeleteItem(id)}
            title={todoTitle}
            completed={completed}
          />
        ))}
      </ul>

      <div className="empty-state">
        <svg className="checklist-icon">
          <use href="#checklist-icon" />
        </svg>
        <h2 className="empty-state__title">Add your first todo</h2>
        <p className="empty-state__description">
          What do you want to get done today?
        </p>
      </div>

      <form className="js-form" onSubmit={onSubmitList}>
        <input
          onChange={onChangeTitle}
          value={title}
          type="text"
          aria-label="Enter a new todo item"
          placeholder="E.g. Build a web app"
          className="js-todo-input"
        />
      </form>

      <h1 className="app-title" style={{ marginTop: '2rem' }}>Get By Id</h1>

      <form className="js-form" onSubmit={onSearchList}>
        <input
          onChange={onChangeSearcInput}
          value={searchInput}
          type="text"
          aria-label="Enter id of todo item"
          placeholder="E.g. 1"
          className="js-todo-input"
        />
      </form>

      <ul className="todo-list js-todo-list" style={{ marginTop: '1rem' }}>
        {searchData?.result && (
          <Todo
            key={searchData.result.id}
            id={searchData.result.id}
            onClickItem={() => onClickItem(searchData.result.id)}
            onDeleteItem={() => onDeleteItem(searchData.result.id)}
            title={searchData.result.title}
            completed={searchData.result.completed}
          />
        )}
      </ul>

      <Box
        sx={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
        }}
      >
        <Fab color="primary" aria-label="Log Out" onClick={logOutHandler}>
          <LogoutIcon />
        </Fab>
      </Box>
    </div>
  );
};

export default List;
