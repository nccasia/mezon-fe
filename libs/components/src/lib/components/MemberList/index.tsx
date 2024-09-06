import {
	ChannelMembersEntity,
	ChannelsEntity,
	selectAllUserClans,
	selectCloseMenu,
	selectCurrentChannel,
	selectMemberIdsByChannelId,
	useAppSelector
} from '@mezon/store';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import ListMember from './listMember';

export type MemberListProps = { className?: string };

function MemberList() {
	const currentChannel = useSelector(selectCurrentChannel);
	const listMemberIds = useAppSelector((state) => selectMemberIdsByChannelId(currentChannel?.id as string)(state));
	return <MemberListContent currentChannel={currentChannel} listMemberIds={listMemberIds} />;
}

const MemberListContent = memo(
	({ currentChannel, listMemberIds }: { currentChannel: ChannelsEntity | null; listMemberIds: string[] }) => {
		const usersClan = useSelector(selectAllUserClans);
		const closeMenu = useSelector(selectCloseMenu);
		const members = currentChannel?.channel_private
			? usersClan.filter((item) => listMemberIds.includes(currentChannel?.id + item.id))
			: usersClan;
		const onlineMembers = (members as ChannelMembersEntity[])
			.filter((item) => {
				return item.user?.online;
			})
			.map((item) => ({ ...item, channelId: currentChannel?.id }));
		const offlineMembers = (members as ChannelMembersEntity[])
			.filter((item) => {
				return !item.user?.online;
			})
			.map((item) => ({ ...item, channelId: currentChannel?.id }));

		return (
			<div className={`self-stretch h-[268px] flex-col justify-start items-start flex p-4 gap-[24px] w-full ${closeMenu ? 'pt-20' : 'pt-4'}`}>
				<div className="w-full">
					<p className="mb-3 dark:text-[#AEAEAE] text-black text-[14px] font-semibold flex items-center gap-[4px] font-title text-xs tracking-wide uppercase">
						MEMBER - {onlineMembers.length}
					</p>
					<div className="flex flex-col gap-4 ">
						<ListMember
							lisMembers={[
								...onlineMembers,
								{
									offlineSeparate: true
								},
								...offlineMembers
							]}
							offlineCount={offlineMembers.length}
						/>
					</div>
				</div>
			</div>
		);
	},
	(prev, next) => {
		return prev.currentChannel?.channel_private === next.currentChannel?.channel_private && prev.listMemberIds === next.listMemberIds;
	}
);

export default memo(MemberList);
