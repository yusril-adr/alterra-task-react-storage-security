import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { ApolloProvider } from '@apollo/client';
import { CookiesProvider } from 'react-cookie';
import App from './App';
import reportWebVitals from './utils/reportWebVitals';
import client from './services/apollo/client';

ReactDOM
  .createRoot(document.getElementById('root'))
  .render(
    <CookiesProvider>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </CookiesProvider>,
  );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
