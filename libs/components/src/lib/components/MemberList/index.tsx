import { ChannelMembersEntity, ChannelsEntity, selectAllChannelMembers, selectCloseMenu, selectCurrentChannel, useAppSelector } from '@mezon/store';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import ListMember from './listMember';

export type MemberListProps = { className?: string };

function MemberList() {
	const currentChannel = useAppSelector(selectCurrentChannel);
	return <MemberListContent currentChannel={currentChannel} />;
}

const MemberListContent = memo(({ currentChannel }: { currentChannel: ChannelsEntity | null }) => {
	const closeMenu = useSelector(selectCloseMenu);
	const members = useAppSelector((state) => selectAllChannelMembers(state, currentChannel?.id as string));
	const onlineMembers = (members as ChannelMembersEntity[])
		.filter((item) => {
			return item.user?.online;
		})
		.sort((a, b) => {
			const nameA = a.clan_nick?.toLowerCase() || a.user?.display_name?.toLowerCase() || a.user?.username?.toLowerCase() || '';
			const nameB = b.clan_nick?.toLowerCase() || b.user?.display_name?.toLowerCase() || b.user?.username?.toLowerCase() || '';
			return nameA.localeCompare(nameB);
		})
		.map((item) => ({ ...item, channelId: currentChannel?.id }));

	const offlineMembers = (members as ChannelMembersEntity[])
		.filter((item) => {
			return !item.user?.online;
		})
		.sort((a, b) => {
			const nameA = a.clan_nick?.toLowerCase() || a.user?.display_name?.toLowerCase() || a.user?.username?.toLowerCase() || '';
			const nameB = b.clan_nick?.toLowerCase() || b.user?.display_name?.toLowerCase() || b.user?.username?.toLowerCase() || '';
			return nameA.localeCompare(nameB);
		})
		.map((item) => ({ ...item, channelId: currentChannel?.id }));

	return (
		<div className={`self-stretch h-full flex-col justify-start items-start flex gap-[24px] w-full ${closeMenu ? 'pt-20' : 'pt-0'}`}>
			<div className="w-full">
				<div className="flex flex-col gap-4 pr-[2px]">
					<ListMember
						lisMembers={[
							{ onlineSeparate: true },
							...onlineMembers,
							{
								offlineSeparate: true
							},
							...offlineMembers
						]}
						offlineCount={offlineMembers.length}
						onlineCount={onlineMembers.length}
					/>
				</div>
			</div>
		</div>
	);
});

export default memo(MemberList);
