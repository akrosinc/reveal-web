export const setToBrowser = (keyName: string, value: string) => localStorage.setItem(keyName, value);

export const removeFromBrowser = (keyName: string) => localStorage.removeItem(keyName);

export const getFromBrowser = (keyName: string) => {
  return localStorage.getItem(keyName);
};
