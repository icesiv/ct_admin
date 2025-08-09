// utils/cookieHelper.ts (or anywhere suitable)
export const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined; // Not in browser environment

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
};

export const removeCookie = (name: string): void => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
};
