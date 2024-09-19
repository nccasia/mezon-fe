import { MezonStoreProvider, initStore, selectIsLogin } from '@mezon/store';
import { CreateMezonClientOptions, MezonContextProvider, useMezon } from '@mezon/transport';
import { GoogleOAuthProvider } from '@react-oauth/google';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useSettingFooter } from '@mezon/core';
import { electronBridge } from '@mezon/utils';
import isElectron from 'is-electron';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import WebFont from 'webfontloader';
import './app.module.scss';
import { preloadedState } from './mock/state';
import { Routes } from './routes';

if (typeof window !== 'undefined') {
	WebFont.load({
		google: {
			families: ['gg sans']
		}
	});
}

const mezon: CreateMezonClientOptions = {
	host: process.env.NX_CHAT_APP_API_HOST as string,
	port: process.env.NX_CHAT_APP_API_PORT as string,
	key: process.env.NX_CHAT_APP_API_KEY as string,
	ssl: process.env.NX_CHAT_APP_API_SECURE === 'true'
};

const AppInitializer = () => {
	const isLogin = useSelector(selectIsLogin);
	const { setIsShowSettingFooterStatus } = useSettingFooter();
	if (isElectron()) {
		if (isLogin) {
			electronBridge?.initListeners(() => {
				setIsShowSettingFooterStatus(true);
			});
		} else {
			electronBridge?.removeAllListeners();
		}
	}

	return null;
};

export function App() {
	const mezon = useMezon();
	const { store, persistor } = useMemo(() => {
		if (!mezon) {
			return { store: null, persistor: null };
		}

		return initStore(mezon, preloadedState);
	}, [mezon]);

	if (!store) {
		return <>loading...</>;
	}

	return (
		<MezonStoreProvider store={store} loading={null} persistor={persistor}>
			<AppInitializer />
			<Routes />
		</MezonStoreProvider>
	);
}

function AppWrapper() {
	return (
		<GoogleOAuthProvider clientId={process.env.NX_CHAT_APP_GOOGLE_CLIENT_ID as string}>
			<MezonContextProvider mezon={mezon} connect={true}>
				<App />
			</MezonContextProvider>
		</GoogleOAuthProvider>
	);
}

export default AppWrapper;
