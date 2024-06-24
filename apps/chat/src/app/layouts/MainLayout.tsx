import { ChatContextProvider, useChatReaction, useGifsStickersEmoji } from '@mezon/core';
import { reactionActions } from '@mezon/store';
import { MezonSuspense } from '@mezon/transport';
import { SubPanelName } from '@mezon/utils';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';

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
