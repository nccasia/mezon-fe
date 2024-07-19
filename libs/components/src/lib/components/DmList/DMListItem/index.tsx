import { useAppNavigation, useAppParams, useMemberStatus, useMenu } from '@mezon/core';
import { directActions, selectCloseMenu, selectIsUnreadDMById, useAppDispatch } from '@mezon/store';
import { MemberProfileType } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import MemberProfile from '../../MemberProfile';
export type DirectMessProp = {
	readonly directMessage: Readonly<any>;
};

export type directMessageValueProps = {
	type: string;
	userId: string[];
	dmID: string;
};

function DMListItem({ directMessage }: DirectMessProp) {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const pathname = useLocation().pathname;
	const isUnReadChannel = useSelector(selectIsUnreadDMById(directMessage.id));
	const { directId: currentDmGroupId } = useAppParams();
	const { toDmGroupPage } = useAppNavigation();
	const { setStatusMenu } = useMenu();
	const closeMenu = useSelector(selectCloseMenu);
	const userStatus = useMemberStatus(directMessage?.user_id?.length === 1 ? directMessage?.user_id[0] : '');

	const [isHovered, setIsHovered] = useState(false);

	const joinToChatAndNavigate = async (DMid: string, type: number) => {
		const result = await dispatch(
			directActions.joinDirectMessage({
				directMessageId: DMid,
				channelName: '',
				type: type,
			}),
		);
		await dispatch(directActions.setDmGroupCurrentId(DMid));
		if (result) {
			navigate(toDmGroupPage(DMid, type));
		}
		if (closeMenu) {
			setStatusMenu(false);
		}
	};

	const handleMouseEnter = () => {
		setIsHovered(true);
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
	};

	const handleCloseClick = async (e: React.MouseEvent, directId: string) => {
		e.stopPropagation();
		await dispatch(directActions.closeDirectMessage({ channel_id: directId }));
		if (directId === currentDmGroupId) {
			navigate(`/chat/direct`);
		}
	};

	const directMessageValue: directMessageValueProps = {
		type: directMessage.type,
		userId: directMessage.user_id,
		dmID: directMessage.id,
	};

	return (
		<div
			key={directMessage.channel_id}
			className={`group relative text-[#AEAEAE] hover:text-white h-fit pl-2 rounded-[6px] dark:hover:bg-black hover:bg-[#E1E1E1] py-2 w-full dark:focus:bg-bgTertiary focus:bg-[#c7c7c7] ${directMessage.channel_id === currentDmGroupId && !pathname.includes('friends') ? 'dark:bg-[#1E1E1E] bg-[#c7c7c7] dark:text-white text-black' : ''}`}
			onClick={() => joinToChatAndNavigate(directMessage.channel_id, directMessage.type)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<MemberProfile
				avatar={
					Number(directMessage.type) === ChannelType.CHANNEL_TYPE_GROUP
						? 'assets/images/avatar-group.png'
						: directMessage?.channel_avatar?.at(0) ?? ''
				}
				name={directMessage?.channel_label ?? ''}
				userNameAva={directMessage?.usernames}
				status={userStatus}
				isHideStatus={true}
				isHideIconStatus={false}
				key={directMessage.channel_id}
				isUnReadDirect={isUnReadChannel}
				directMessageValue={directMessageValue}
				isHideAnimation={true}
				positionType={MemberProfileType.DM_LIST}
				countMember={(directMessage?.user_id?.length || 0) +1}
			/>
			{isHovered && (
				<button
					className="absolute right-2 top-3 text-gray-500 hover:text-red-500"
					onClick={(e) => handleCloseClick(e, directMessage.channel_id)}
				>
					X
				</button>
			)}
		</div>
	);
}

export default DMListItem;
