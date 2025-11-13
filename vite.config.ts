import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		tsconfigPaths(),
		{
			name: "preserve-laravel-files",
			buildStart() {
				const publicDir = path.resolve(__dirname, "../be-psacard/public");
				const preserveFiles = ["index.php", ".htaccess", "robots.txt"];
				const backupDir = path.resolve(__dirname, ".laravel-backup");

				// Backup files yang ingin dipertahankan
				if (!fs.existsSync(backupDir)) {
					fs.mkdirSync(backupDir, { recursive: true });
				}

				preserveFiles.forEach((file) => {
					const srcPath = path.join(publicDir, file);
					const destPath = path.join(backupDir, file);
					if (fs.existsSync(srcPath)) {
						fs.copyFileSync(srcPath, destPath);
					}
				});
			},
			closeBundle() {
				const publicDir = path.resolve(__dirname, "../be-psacard/public");
				const preserveFiles = ["index.php", ".htaccess", "robots.txt"];
				const backupDir = path.resolve(__dirname, ".laravel-backup");

				// Restore files setelah build
				preserveFiles.forEach((file) => {
					const srcPath = path.join(backupDir, file);
					const destPath = path.join(publicDir, file);
					if (fs.existsSync(srcPath)) {
						fs.copyFileSync(srcPath, destPath);
					}
				});
			},
		},
	],
	build: {
		outDir: path.resolve(__dirname, "../be-psacard/public"),
		emptyOutDir: true,
	},
});
