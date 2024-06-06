import { useAuth } from '@mezon/core';
import { fcmActions, useAppDispatch } from '@mezon/store';
import { MezonUiProvider } from '@mezon/ui';
import { onMessageListener, requestForToken } from '@mezon/components';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const theme = 'dark';
const AppLayout = () => {
	const dispatch = useAppDispatch();
	const { userProfile } = useAuth();
	const fcmTokenObject = JSON.parse(localStorage.getItem('fcmTokenObject') as string);
	const navigate = useNavigate();
	const handleNewMessage = (payload: any) => {
		if (typeof payload === 'object' && payload !== null) {
			const parts = payload.notification.body;
			toast.info(parts, {
				onClick: () => {
					const fullLink = payload.data.link;
					const baseUrl = 'https://mezon.vn';
					const relativeLink = fullLink.replace(baseUrl, '');
					navigate(relativeLink);
				},
			});
		}
		onMessageListener()
			.then(handleNewMessage)
			.catch((error: Error) => {
				console.error('Error listening for messages:', error);
			});
	};

	useEffect(() => {
		onMessageListener()
			.then(handleNewMessage)
			.catch((error: Error) => {
				console.error('Error listening for messages:', error);
			});

		if (fcmTokenObject?.token) {
			dispatch(fcmActions.registFcmDeviceToken({ tokenId: fcmTokenObject.token ?? '', deviceId: fcmTokenObject.deviceId ?? '' }));
		} else {
			requestForToken()
				.then((token) => {
					if (token) {
						dispatch(fcmActions.registFcmDeviceToken({ tokenId: token, deviceId: userProfile?.user?.id || '' }));
					}
				})
				.catch((error: Error) => {
					console.error('Error fetching token:', error);
				});
		}
	}, []);

	return (
		<MezonUiProvider themeName={theme}>
			<div id="app-layout">
				<Outlet />
			</div>
		</MezonUiProvider>
	);
};

export default AppLayout;
