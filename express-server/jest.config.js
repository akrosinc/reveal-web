process.env.TZ = 'EAT';

module.exports = {
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testEnvironment: 'node',
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/tests/', '!src/index.ts'],
    coverageReporters: ['lcov', 'html'],
};
