import { ChatContext, ChatContextProvider, useFriends, useGifsStickersEmoji } from '@mezon/core';
import { reactionActions, selectAllNotification, selectTotalUnreadDM } from '@mezon/store';
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
	const allNotify = useSelector(selectAllNotification);
	const totalUnreadDM = useSelector(selectTotalUnreadDM);
	const { quantityPendingRequest } = useFriends();

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
		const notificationCount = allNotify.length + totalUnreadDM + quantityPendingRequest;
		if (notificationCount > 0) {
			document.title = `Mezon (${notificationCount})`;
		} else {
			document.title = 'Mezon';
		}
		if (isElectron()) {
			electronBridge?.setBadgeCount(notificationCount);
		}
	}, [allNotify.length, totalUnreadDM, quantityPendingRequest]);

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
