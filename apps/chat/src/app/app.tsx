import { MezonStoreProvider, initStore } from '@mezon/store';
import { CreateMezonClientOptions, MezonContextProvider, useMezon } from '@mezon/transport';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VoiceContextProvider } from '@mezon/voice';
import { useEffect, useMemo } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import WebFont from 'webfontloader';
import './app.module.scss';
import { preloadedState } from './mock/state';
import { routes } from './routes/index';

const mezon: CreateMezonClientOptions = {
	host: process.env.NX_CHAT_APP_API_HOST as string,
	port: process.env.NX_CHAT_APP_API_PORT as string,
	key: process.env.NX_CHAT_APP_API_KEY as string,
	ssl: process.env.NX_CHAT_APP_API_SECURE === 'true',
};

export function App() {
	const mezon = useMezon();
	const { store, persistor } = useMemo(() => {
		return initStore(mezon, preloadedState);
	}, [mezon]);
	if (!store) {
		return <>loading...</>;
	}
	return (
		<MezonStoreProvider store={store} loading={null} persistor={persistor}>
			<RouterProvider router={routes} />
		</MezonStoreProvider>
	);
}

function AppWrapper() {
	useEffect(() => {
		WebFont.load({
			google: {
				families: ['gg sans'],
			},
		});
	}, []);

	return (
		<GoogleOAuthProvider clientId={process.env.NX_CHAT_APP_GOOGLE_CLIENT_ID as string}>
			<MezonContextProvider mezon={mezon} connect={true}>
				<VoiceContextProvider>
						<App />
				</VoiceContextProvider>
			</MezonContextProvider>
		</GoogleOAuthProvider>
	);
}

export default AppWrapper;
