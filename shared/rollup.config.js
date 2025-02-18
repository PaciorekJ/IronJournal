import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import fg from "fast-glob";
import typescript from "rollup-plugin-typescript2";

const inputFiles = fg.sync("src/**/*.ts");

export default {
    input: inputFiles,
    output: {
        dir: "build",
        format: "esm",
        preserveModules: true,
        preserveModulesRoot: "src",
        sourcemap: true,
    },
    external: [
        "amqplib",
        "axios",
        "dotenv",
        "mongoose",
        "uuid",
        "luxon",
        "zod",
    ],
    plugins: [
        nodeResolve({ extensions: [".js", ".ts"] }),
        commonjs(),
        typescript({ useTsconfigDeclarationDir: true }),
    ],
};
