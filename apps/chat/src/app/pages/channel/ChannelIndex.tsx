import { useAppNavigation, useAppParams } from '@mezon/core';
import { selectDefaultChannelIdByClanId } from '@mezon/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import ChannelMessages from './ChannelMessages';

export default function ChannelIndex() {
	const { clanId } = useAppParams();
	const defaultChannelId = useSelector(selectDefaultChannelIdByClanId(clanId || ''));
	const { navigate } = useAppNavigation();

	useEffect(() => {
		if (defaultChannelId) {
			navigate(`./${defaultChannelId}`);
		}
	}, [defaultChannelId, navigate]);

	return (
		<div className="flex flex-col flex-1 shrink min-w-0 dark:bg-bgPrimary bg-bgLightModeSecond h-[100%] overflow-hidden">
			<div className="flex h-heightWithoutTopBar flex-row ">
				<div className="flex flex-col flex-1 w-full h-full">
					<div className="overflow-y-auto bg-transparent max-w-widthMessageViewChat overflow-x-hidden max-h-heightMessageViewChat h-heightMessageViewChat">
						{/* <ChannelMessages.Skeleton /> */}
					</div>
					<div className="flex-shrink-0 flex flex-col bg-transparent h-auto">
						{/* <ChannelMessages.Skeleton /> */}
					</div>
				</div>
				(
				{/* <div className="w-[245px] bg-bgSurface  lg:flex hidden text-[#84ADFF]">
						<MemberList />
					</div> */}
				)
			</div>
		</div>
	);
}
