export const useStorage = (): Storage | undefined => {
  if (typeof window !== "undefined") {
    return localStorage;
  }
};
