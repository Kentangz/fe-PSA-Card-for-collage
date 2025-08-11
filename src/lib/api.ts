const isProd = import.meta.env.PROD;

export const API_URL = isProd ? "/api" : "http://localhost:8000/api";
export const BE_URL = isProd ? "" : "http://localhost:8000";
