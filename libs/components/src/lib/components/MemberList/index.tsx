import { ChannelMembersEntity, selectCurrentChannelId, selectMemberStatus, selectMembersByChannelId } from '@mezon/store';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import MemberItem from './MemberItem';

export type MemberListProps = { className?: string };

function MemberList() {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const rawMembers = useSelector(selectMembersByChannelId(currentChannelId));
	const onlineStatus = useSelector(selectMemberStatus);

	const onlineMembers = useMemo(() => {
		if (!rawMembers) return [];
		return rawMembers.filter((user) => user.user?.online === true);
	}, [onlineStatus, rawMembers]);

	const offlineMembers = useMemo(() => {
		if (!rawMembers) return [];
		return rawMembers.filter((user) => user.user?.online !== true);
	}, [onlineStatus, rawMembers]);
	return (
		<div className="self-stretch h-[268px] flex-col justify-start items-start flex p-4 gap-[24px] w-full">
			<div className="w-full">
				<p className="mb-3 text-[#AEAEAE] text-[14px] font-bold flex items-center gap-[4px] font-title text-xs tracking-wide uppercase">
					{/* {role.title} */}
					MEMBER - {onlineMembers.length}
				</p>
				<div className="flex flex-col gap-4 ">
					{/* {role?.users.filter((obj: ChannelMembersEntity) => obj.user?.online).map((user: ChannelMembersEntity) => ( */}
					{onlineMembers.map((user: ChannelMembersEntity) => (
						<MemberItem user={user} key={user?.user?.id} />
					))}
				</div>
				{offlineMembers.length > 0 && (
					<>
						<p className="mt-7 mb-3 text-[#AEAEAE] text-[14px] font-bold flex items-center gap-[4px] font-title text-xs tracking-wide uppercase">
							Offline - {offlineMembers.length}
						</p>
						<div className="flex flex-col gap-4">
							{offlineMembers.map((user: ChannelMembersEntity) => (
								<div key={user?.id} className="opacity-60">
									<MemberItem user={user} key={user?.user?.id} />
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
