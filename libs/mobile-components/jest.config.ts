module.exports = {
	displayName: 'mobile-components',
	preset: 'react-native',
	resolver: '@nx/jest/plugins/resolver',
	moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
	setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
	moduleNameMapper: {
		'\\.svg$': '@nx/react-native/plugins/jest/svg-mock',
	},
	transform: {
		'^.+.(js|ts|tsx)$': [
			'babel-jest',
			{
				configFile: __dirname + '/.babelrc.js',
			},
		],
		'^.+.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$': require.resolve('react-native/jest/assetFileTransformer.js'),
	},
	coverageDirectory: '../../coverage/libs/mobile-components',
};
