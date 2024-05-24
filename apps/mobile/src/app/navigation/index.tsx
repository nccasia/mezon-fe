import React from 'react';
import {CreateMezonClientOptions, MezonContextProvider} from "@mezon/transport";
import RootNavigation from "./RootNavigator";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { NX_CHAT_APP_API_HOST } from '@env';
import { I18nextProvider } from 'react-i18next';
import i18n from '@mezon/translations';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../configs/toastConfig';

const mezon: CreateMezonClientOptions = {
	host: process.env.NX_CHAT_APP_API_HOST as string,
	port: process.env.NX_CHAT_APP_API_PORT as string,
	key: process.env.NX_CHAT_APP_API_KEY as string,
	ssl: process.env.NX_CHAT_APP_API_SECURE === 'true',
};

const App = () => {
	return (
		<I18nextProvider i18n={i18n}>
			<MezonContextProvider mezon={mezon} connect={true}>
				<RootNavigation />
				<Toast config={toastConfig} />
			</MezonContextProvider>
		</I18nextProvider>
	);
};

export default App;
