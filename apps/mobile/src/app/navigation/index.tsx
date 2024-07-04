import React from 'react';
import { CreateMezonClientOptions, MezonContextProvider } from "@mezon/transport";
import RootNavigation from "./RootNavigator";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { NX_CHAT_APP_API_HOST } from '@env';
import { I18nextProvider } from 'react-i18next';
// @ts-ignore
import i18n from '@mezon/translations';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../configs/toastConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import 'react-native-svg'

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
	dsn: process.env.NX_MOBILE_SENTRY_DSN,
	tracesSampleRate: 1.0,
	enabled: !__DEV__,
	integrations: [
		new Sentry.ReactNativeTracing({
			routingInstrumentation,
		}),
	],
});

const mezon: CreateMezonClientOptions = {
	host: process.env.NX_CHAT_APP_API_HOST as string,
	key: process.env.NX_CHAT_APP_API_KEY as string,
	port: process.env.NX_CHAT_APP_API_PORT as string,
	ssl: process.env.NX_CHAT_APP_API_SECURE === 'true',
};

const App = () => {
	return (
		<SafeAreaProvider>
			<I18nextProvider i18n={i18n}>
				<MezonContextProvider mezon={mezon} connect={true}>
					<RootNavigation />
					<Toast config={toastConfig} />
				</MezonContextProvider>
			</I18nextProvider>
		</SafeAreaProvider>

	);
};

export default App;
