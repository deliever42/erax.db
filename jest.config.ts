import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    clearMocks: true,
    coverageProvider: 'v8',
    moduleDirectories: ['node_modules'],
    moduleFileExtensions: ['js'],
    rootDir: 'test',
    verbose: true,
    bail: true,
    errorOnDeprecated: true,
    detectOpenHandles: false
};

export default config;
