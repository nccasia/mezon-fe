import { ChannelMembersEntity, selectTheme } from '@mezon/store';
import { MemberProfileType } from '@mezon/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
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

	const appearanceTheme = useSelector(selectTheme);

	useEffect(() => {
		const handleResize = () => setHeight(window.innerHeight - heightTopBar);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const parentRef = useRef(null);
	const rowVirtualizer = useVirtualizer({
		count: lisMembers.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 48,
		overscan: 5
	});
	return (
		<div
			ref={parentRef}
			className={`custom-member-list ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
			style={{
				height: height,
				overflow: 'auto'
			}}
		>
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					width: '100%',
					position: 'relative'
				}}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => {
					const user = lisMembers[virtualRow.index];
					return (
						<div
							key={virtualRow.index}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: `${virtualRow.size}px`,
								transform: `translateY(${virtualRow.start}px)`
							}}
						>
							<div className="flex items-center px-4 h-full">
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
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default ListMember;
