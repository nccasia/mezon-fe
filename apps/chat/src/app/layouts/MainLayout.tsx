import { ChatContext, ChatContextProvider, useFriends, useGifsStickersEmoji } from '@mezon/core';
import { reactionActions, selectAnyUnreadChannel, selectTotalUnreadDM } from '@mezon/store';
import { selectSpecificNotifications, useAppSelector } from '@mezon/store-mobile';
import { MezonSuspense } from '@mezon/transport';
import { SubPanelName, electronBridge } from '@mezon/utils';
import isElectron from 'is-electron';
import debounce from 'lodash.debounce';
import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

const GlobalEventListener = () => {
	const { handleReconnect } = useContext(ChatContext);

	const navigate = useNavigate();
	const allNotificationUnread = useSelector(selectSpecificNotifications);

	const totalUnreadDM = useSelector(selectTotalUnreadDM);
	const { quantityPendingRequest } = useFriends();

	const hasUnreadChannel = useAppSelector((state) => selectAnyUnreadChannel(state));

	useEffect(() => {
		const handleNavigateToPath = (_: unknown, path: string) => {
			navigate(path);
		};
		window.electron?.on('navigate-to-path', handleNavigateToPath);
		return () => {
			window.electron?.removeListener('navigate-to-path', handleNavigateToPath);
		};
	}, [navigate]);

	useEffect(() => {
		const reconnectSocket = debounce(() => {
			if (document.visibilityState === 'visible') {
				handleReconnect('Socket disconnected, attempting to reconnect...');
			}
		}, 100);

		window.addEventListener('focus', reconnectSocket);
		window.addEventListener('online', reconnectSocket);
		return () => {
			window.removeEventListener('focus', reconnectSocket);
			window.removeEventListener('online', reconnectSocket);
		};
	}, [handleReconnect]);

	useEffect(() => {
		const notificationCount = allNotificationUnread.length + totalUnreadDM + quantityPendingRequest;
		if (!isElectron()) {
			if (notificationCount > 0) {
				document.title = `(${notificationCount}) Mezon`;
			} else {
				document.title = 'Mezon';
			}
		}

		if (isElectron()) {
			if (hasUnreadChannel && !notificationCount) {
				electronBridge?.setBadgeCount(null);
				return;
			}
			electronBridge?.setBadgeCount(notificationCount);
		}
	}, [allNotificationUnread.length, totalUnreadDM, quantityPendingRequest, hasUnreadChannel]);

	return null;
};

const MainLayout = () => {
	const dispatch = useDispatch();
	const { setSubPanelActive } = useGifsStickersEmoji();
	const handleClickingOutside = () => {
		setSubPanelActive(SubPanelName.NONE);
		dispatch(reactionActions.setUserReactionPanelState(false));
	};
	return (
		<div
			id="main-layout"
			onClick={handleClickingOutside}
			onContextMenu={(event: React.MouseEvent) => {
				event.preventDefault();
			}}
		>
			<Outlet />
			<GlobalEventListener />
		</div>
	);
};

const MainLayoutWrapper = () => {
	return (
		<MezonSuspense>
			<ChatContextProvider>
				<MainLayout />
			</ChatContextProvider>
		</MezonSuspense>
	);
};

export default MainLayoutWrapper;
