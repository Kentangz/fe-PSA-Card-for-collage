const ALLOWED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/jpg",
	"image/gif",
] as const;
export type AllowedMimeType = (typeof ALLOWED_TYPES)[number];

export const MAX_FILE_SIZE_BYTES = 2048 * 1024; // 2MB

export const isAllowedType = (type: string): type is AllowedMimeType => {
	return (ALLOWED_TYPES as readonly string[]).includes(type);
};

export const validateFiles = (files: File[], maxSize = MAX_FILE_SIZE_BYTES) => {
	const valid: File[] = [];
	const errors: string[] = [];
	for (const file of files) {
		if (!isAllowedType(file.type)) {
			errors.push(`${file.name}: Only JPEG, PNG, JPG, or GIF images allowed`);
			continue;
		}
		if (file.size > maxSize) {
			errors.push(
				`${file.name}: File size must be less than ${Math.round(
					maxSize / 1024 / 1024
				)}MB`
			);
			continue;
		}
		valid.push(file);
	}
	return { valid, errors };
};
