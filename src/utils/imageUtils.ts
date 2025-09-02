import { BE_URL } from "@/lib/api";

export const getImageUrl = (path: string) => `${BE_URL}/storage/${path}`;
