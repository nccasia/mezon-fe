import { useAppNavigation, useAppParams } from '@mezon/core';
import { selectDefaultChannelIdByClanId } from '@mezon/store';
import { useSelector } from 'react-redux';

import { useEffect } from 'react';
import 'react-loading-skeleton/dist/skeleton.css';

export function ClanIndex() {
	const { serverId } = useAppParams();
	const defaultChannelId = useSelector(selectDefaultChannelIdByClanId(serverId || ''));
	const { navigate } = useAppNavigation();

	useEffect(() => {
		if (defaultChannelId) {
			navigate(`./channels/${defaultChannelId}`);
		}
	}, [defaultChannelId, navigate]);

	return (
		<div className="flex-row bg-bgSurface flex grow">
			<div className="flex flex-col bg-bgSurface relative"></div>
			<div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%] overflow-hidden"></div>
		</div>
	);
}
