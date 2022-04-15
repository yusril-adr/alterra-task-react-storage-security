import { encode, decode } from 'js-base64';
import CONFIG from '../global/config';

const TokenManager = {
  createToken(objectParam) {
    const objectJson = JSON.stringify({
      ...objectParam,
      expired: +new Date() + CONFIG.DEFAULT_TOKEN_EXPIRED,
    });
    const result = encode(objectJson);
    return result;
  },

  verifyToken(token) {
    const decoded = decode(token);
    const result = JSON.parse(decoded);
    if (result.expired < +new Date()) throw new Error('Token is Expired.');
    delete result.expired;
    return result;
  },
};

export default TokenManager;
