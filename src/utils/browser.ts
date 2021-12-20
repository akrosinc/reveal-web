export const setToBrowser = (key: string, value: string) =>
  localStorage.setItem(key, value);

export const getFromBrowser = (key: string) => {
  const item = localStorage.getItem(key);
  return item ? item : null;
};

export const removeFromBrowser = (keyName: string) =>
  localStorage.removeItem(keyName);