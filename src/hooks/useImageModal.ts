import { useState, useCallback } from "react";

export const useImageModal = () => {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const open = useCallback((url: string) => setSelectedImage(url), []);
	const close = useCallback(() => setSelectedImage(null), []);
	return { selectedImage, open, close };
};
