import { vitePlugin as remix } from "@remix-run/dev";
import path from "path"; // Import the 'path' module
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [remix(), tsconfigPaths()],
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "app"), // Explicitly define alias for '~'
        },
    },
});
