import { onMessageListener, requestForToken, ToastController } from '@mezon/components';
import { useAuth } from '@mezon/core';
import { fcmActions, useAppDispatch } from '@mezon/store';
import { MezonUiProvider } from '@mezon/ui';
import { useEffect } from 'react';
import { Outlet, useLoaderData, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IAppLoaderData } from '../loaders/appLoader';
import isElectron from 'is-electron';
const theme = 'dark';

const AppLayout = () => {
	const dispatch = useAppDispatch();
	const { userProfile } = useAuth();
	const fcmTokenObject = JSON.parse(localStorage.getItem('fcmTokenObject') as string);
	const navigate = useNavigate();
	const { redirectTo } = useLoaderData() as IAppLoaderData;
	useEffect(() => {
		if (redirectTo) {
			navigate(redirectTo);
		}
	}, [redirectTo, navigate]);
	// TODO: move this to a firebase context
	const handleNewMessage = (payload: any) => {
		if (typeof payload === 'object' && payload !== null) {
			const message = payload.notification.body;
			const image = payload.notification.image;
			const title = payload.notification.title;

			toast(
				<div>
					<div className="flex items-center">
						{image && <img src={image} alt="Notification" className="min-w-10 min-h-10 size-10 rounded-full object-cover" />}
						<div className="ml-3">
							<span className="block font-semibold">{title}</span>
						</div>
					</div>
					<div>
						<p className="mt-1 ml-[10px]">{message}</p>
					</div>
				</div>,
				{
					onClick: () => {
						const fullLink = payload.data.link;
						const baseUrl = 'https://mezon.vn';
						const relativeLink = fullLink.replace(baseUrl, '');
						navigate(relativeLink);
					},
				},
			);
		}
		onMessageListener()
			.then(handleNewMessage)
			.catch((error: Error) => {
				console.error('Error listening for messages:', error);
			});
	};

	// TODO: move this to a firebase context
	useEffect(() => {
		if (isElectron()) {
			onMessageListener()
				.then(handleNewMessage)
				.catch((error: Error) => {
					console.error('Error listening for messages:', error);
				});
	
			if (fcmTokenObject?.token) {
				dispatch(
					fcmActions.registFcmDeviceToken({
						tokenId: fcmTokenObject.token ?? '',
						deviceId: fcmTokenObject.deviceId ?? '',
						platform: 'desktop',
					}),
				);
			} else {
				requestForToken()
					.then((token) => {
						if (token) {
							dispatch(fcmActions.registFcmDeviceToken({ tokenId: token, deviceId: userProfile?.user?.id || '', platform: 'desktop' }));
						}
					})
					.catch((error: Error) => {
						console.error('Error fetching token:', error);
					});
			}
		}
	}, []);

	return (
		<MezonUiProvider themeName={theme}>
			<div id="app-layout">
				<ToastController />
				<Outlet />
			</div>
		</MezonUiProvider>
	);
};

export default AppLayout;
