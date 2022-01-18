import axios, { CancelTokenSource } from 'axios';

export const cancelTokenGenerator = (): CancelTokenSource => {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  return source;
};
