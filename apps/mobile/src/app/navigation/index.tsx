import { CreateMezonClientOptions, MezonContextProvider } from "@mezon/transport";
import RootNavigation from "./RootNavigator";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { NX_CHAT_APP_API_HOST } from '@env';
import { I18nextProvider } from 'react-i18next';
import i18n from '@mezon/translations';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../configs/toastConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from "@sentry/react-native";

const mezon: CreateMezonClientOptions = {
	host: process.env.NX_CHAT_APP_API_HOST as string,
	key: process.env.NX_CHAT_APP_API_KEY as string,
	port: process.env.NX_CHAT_APP_API_PORT as string,
	ssl: process.env.NX_CHAT_APP_API_SECURE === 'true',
};

Sentry.init({
	dsn: "https://424be60a53620c044e6794226a756d99@o4507491355918336.ingest.us.sentry.io/4507491365027840",
	
	tracesSampleRate: 1.0,
	_experiments: {
		profilesSampleRate: 1.0,
	},
});

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

export default Sentry.wrap(App);
