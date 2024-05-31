import { defineConfig } from 'tsup';

export default defineConfig({
    format: ['cjs', 'esm'],
    entry: {'docs-chat-assistant':'./src/Assistant/index.ts', 'api/docs-chat-assistant': './src/api/index.ts'},
    name: 'docs-chat-assistant',
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
});