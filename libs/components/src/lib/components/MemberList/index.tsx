import { useChannelMembers } from '@mezon/core';
import { ChannelMembersEntity, selectCurrentChannelId } from '@mezon/store';
import { useSelector } from 'react-redux';
import MemberItem from './MemberItem';

export type MemberListProps = { className?: string };

function MemberList() {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const { onlineMembers, offlineMembers } = useChannelMembers({ channelId: currentChannelId });

	return (
		<div className="self-stretch h-[268px] flex-col justify-start items-start flex p-4 gap-[24px] w-full">
			<div className="w-full">
				<p className="mb-3 text-[#AEAEAE] text-[14px] font-bold flex items-center gap-[4px] font-title text-xs tracking-wide uppercase">
					MEMBER - {onlineMembers.length}
				</p>
				<div className="flex flex-col gap-4 ">
					{onlineMembers.map((user: ChannelMembersEntity) => (
						<MemberItem user={user} key={user?.user?.id} listProfile={true} />
					))}
				</div>
				{offlineMembers.length > 0 && (
					<>
						<p className="mt-7 mb-3 text-[#AEAEAE] text-[14px] font-bold flex items-center gap-[4px] font-title text-xs tracking-wide uppercase">
							Offline - {offlineMembers.length}
						</p>
						<div className="flex flex-col gap-4">
							{offlineMembers.map((user: ChannelMembersEntity) => (
								<div key={user?.id}>
									<MemberItem user={user} key={user?.user?.id} listProfile={true} isOffline={true} />
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default MemberList;
