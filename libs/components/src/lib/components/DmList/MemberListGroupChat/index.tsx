import { MemberProfile } from '@mezon/components';
import { useAppParams } from '@mezon/core';
import { ChannelMembersEntity, selectMembersByChannelId } from '@mezon/store';
import { useSelector } from 'react-redux';

export type MemberListProps = { className?: string; directMessageId: string | undefined };

function MemberListGroupChat({ directMessageId }: MemberListProps) {
	const { directId } = useAppParams();
	const rawMembers = useSelector(selectMembersByChannelId(directId));

	return (
		<div className="self-stretch h-[268px] flex-col justify-start items-start flex p-[24px] pt-[16px] pr-[24px] pb-[16px] pl-[16px] gap-[24px]">
			<div>
				<p className="mb-3 text-[#AEAEAE] font-semibold flex items-center gap-[4px] font-title text-xs tracking-wide uppercase">MEMBER</p>
				{
					<div className="flex flex-col gap-4 text-[#AEAEAE]">
						{rawMembers.map((user: ChannelMembersEntity) => (
							<MemberProfile
								numberCharacterCollapse={30}
								avatar={user?.user?.avatar_url ?? ''}
								name={user?.user?.username ?? ''}
								status={user?.user?.online}
								isHideStatus={true}
								listProfile={true}
								user={user}
								key={user.id}
							/>
						))}
					</div>
				}
			</div>
		</div>
	);
}

export default MemberListGroupChat;
