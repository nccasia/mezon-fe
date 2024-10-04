module.exports = function (api) {
	api.cache(true);

	if (
		process.env.NX_TASK_TARGET_TARGET &&
		(process.env.NX_TASK_TARGET_TARGET === 'build' || process.env.NX_TASK_TARGET_TARGET.includes('storybook'))
	) {
		return {
			presets: [
				[
					'@nx/react/babel',
					{
						runtime: 'automatic'
					}
				]
			],
			plugins: [
				'react-native-reanimated/plugin',
				[
					'module:react-native-dotenv',
					{
						envName: 'APP_ENV',
						moduleName: '@env',
						path: '.env'
					}
				]
			]
		};
	}

	return {
		presets: [['module:@react-native/babel-preset', { useTransformReactJSX: true }]],
		plugins: [
			'react-native-reanimated/plugin',
			[
				'module:react-native-dotenv',
				{
					envName: 'APP_ENV',
					moduleName: '@env',
					path: '.env'
				}
			]
		]
	};
};
