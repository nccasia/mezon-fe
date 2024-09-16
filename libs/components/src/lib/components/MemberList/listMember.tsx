import { ChannelMembersEntity } from '@mezon/store';
import { MemberProfileType } from '@mezon/utils';
import { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import MemberItem from './MemberItem';

type ListMemberProps = {
	lisMembers: ({ offlineSeparate: boolean } | { onlineSeparate: boolean } | ChannelMembersEntity)[];
	offlineCount?: number;
	onlineCount?: number;
};

const heightTopBar = 60;

const ListMember = (props: ListMemberProps) => {
	const { lisMembers, offlineCount, onlineCount } = props;
	const [height, setHeight] = useState(window.innerHeight - heightTopBar);

	useEffect(() => {
		const handleResize = () => setHeight(window.innerHeight);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
		const user = lisMembers[index];
		return (
			<div style={style} className="flex items-center px-4">
				{'onlineSeparate' in user ? (
					<p className="dark:text-[#AEAEAE] text-black text-[14px] font-semibold flex items-center gap-[4px] font-title text-xs tracking-wide uppercase">
						Member - {onlineCount}
					</p>
				) : 'offlineSeparate' in user ? (
					<p className="dark:text-[#AEAEAE] text-black text-[14px] font-semibold flex items-center gap-[4px] font-title text-xs tracking-wide uppercase">
						Offline - {offlineCount}
					</p>
				) : (
					<MemberItem
						name={user.clan_nick || user?.user?.display_name || user?.user?.username}
						user={user}
						key={user?.user?.id}
						listProfile={true}
						isOffline={!user?.user?.online}
						positionType={MemberProfileType.MEMBER_LIST}
						isDM={false}
					/>
				)}
			</div>
		);
	};

	return (
		<List height={height} itemCount={lisMembers.length} itemSize={48} width={'100%'} className="custom-member-list thread-scroll">
			{Row}
		</List>
	);
};

export default ListMember;
