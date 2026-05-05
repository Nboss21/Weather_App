const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");
export const API_URL = `${API_BASE_URL}/api`;
