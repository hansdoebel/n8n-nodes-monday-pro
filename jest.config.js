module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/tests', '<rootDir>/nodes', '<rootDir>/credentials'],
	testMatch: ['**/tests/**/*.test.ts'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	collectCoverageFrom: [
		'nodes/**/*.ts',
		'credentials/**/*.ts',
		'!**/*.d.ts',
		'!**/node_modules/**',
		'!**/dist/**',
	],
	coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 50,
			lines: 50,
			statements: 50,
		},
	},
	moduleNameMapper: {
		'^@utils/(.*)$': '<rootDir>/nodes/MondayPro/utils/$1',
		'^@types/(.*)$': '<rootDir>/nodes/MondayPro/types/$1',
		'^@helpers/(.*)$': '<rootDir>/nodes/MondayPro/helpers/$1',
		'^@resources/(.*)$': '<rootDir>/nodes/MondayPro/resources/$1',
		'^@/(.*)$': '<rootDir>/nodes/$1',
	},
	testPathIgnorePatterns: ['/node_modules/', '/dist/'],
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: {
					esModuleInterop: true,
					allowSyntheticDefaultImports: true,
				},
			},
		],
	},
};
