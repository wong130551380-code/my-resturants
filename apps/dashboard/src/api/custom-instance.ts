import { Platform } from "react-native";

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "android") return "http://10.0.2.2:3000";
    return "http://localhost:3000";
  }
  return "http://localhost:3000";
};

export const API_BASE_URL = getBaseUrl();

export async function customInstance<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(errorBody.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}
