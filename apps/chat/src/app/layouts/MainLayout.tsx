import { ChatContextProvider, useGifsStickersEmoji, useReference } from '@mezon/core';
import { MezonSuspense } from '@mezon/transport';
import { SubPanelName } from '@mezon/utils';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
	const { setSubPanelActive } = useGifsStickersEmoji();
	const handleClickingOutside = () => {
		setSubPanelActive(SubPanelName.NONE);
	};
	return (
		<div id="main-layout" onClick={handleClickingOutside}>
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
