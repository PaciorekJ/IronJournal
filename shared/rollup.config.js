import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import fg from "fast-glob";
import typescript from "rollup-plugin-typescript2";

const inputFiles = [
    "src/index.ts",
    "src/constants/index.ts",
    ...fg.sync("src/constants/*.ts"),
    "src/database/index.ts",
    "src/models/index.ts",
    ...fg.sync("src/models/*.ts"),
    "src/rabbitMQ/index.ts",
    "src/localization/index.ts",
    ...fg.sync("src/localization/*.ts"),
];

export default {
    input: inputFiles,
    output: {
        dir: "dist/esm",
        format: "esm",
        preserveModules: true, // Preserves directory structure
        preserveModulesRoot: "src", // Keeps 'src' as the root in 'dist/esm'
        sourcemap: true,
    },
    external: ["amqplib", "axios", "dotenv", "mongoose", "uuid"],
    plugins: [
        nodeResolve({ extensions: [".js", ".ts"] }),
        commonjs(),
        typescript({
            tsconfig: "tsconfig.esm.json",
            useTsconfigDeclarationDir: true,
        }),
    ],
};
