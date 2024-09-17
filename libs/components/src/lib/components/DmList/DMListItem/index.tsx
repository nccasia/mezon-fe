import { useAppNavigation, useAppParams, useMenu } from '@mezon/core';
import { ChannelMembersEntity, directActions, selectCloseMenu, selectIsUnreadDMById, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { IChannel, MemberProfileType } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import MemberProfile from '../../MemberProfile';
export type DirectMessProp = {
	readonly directMessage: Readonly<IChannel>;
};

export type directMessageValueProps = {
	type?: number;
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

	const joinToChatAndNavigate = async (DMid: string, type: number) => {
		const result = await dispatch(
			directActions.joinDirectMessage({
				directMessageId: DMid,
				channelName: '',
				type: type
			})
		);
		await dispatch(directActions.setDmGroupCurrentId(DMid));
		if (result) {
			navigate(toDmGroupPage(DMid, type));
		}
		if (closeMenu) {
			setStatusMenu(false);
		}
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
		userId: directMessage.user_id ?? [],
		dmID: directMessage.id
	};

	const isTypeDMGroup = Number(directMessage.type) === ChannelType.CHANNEL_TYPE_GROUP;

	return (
		<div
			key={directMessage.channel_id}
			className={`group/itemListDm relative text-[#AEAEAE] hover:text-white h-fit pl-2 rounded-[6px] dark:hover:bg-black hover:bg-[#E1E1E1] py-2 w-full dark:focus:bg-bgTertiary focus:bg-[#c7c7c7] ${directMessage.channel_id === currentDmGroupId && !pathname.includes('friends') ? 'dark:bg-[#1E1E1E] bg-[#c7c7c7] dark:text-white text-black' : ''}`}
			onClick={() => joinToChatAndNavigate(directMessage.channel_id as string, directMessage.type as number)}
		>
			<MemberProfile
				avatar={isTypeDMGroup ? 'assets/images/avatar-group.png' : (directMessage?.channel_avatar?.at(0) ?? '')}
				name={(directMessage?.channel_label || directMessage?.usernames) ?? `${directMessage.creator_name}'s Group` ?? ''}
				userNameAva={directMessage?.usernames}
				status={directMessage.is_online?.some(Boolean)}
				isHideStatus={true}
				isHideIconStatus={false}
				key={directMessage.channel_id}
				isUnReadDirect={isUnReadChannel}
				directMessageValue={directMessageValue}
				isHideAnimation={true}
				positionType={MemberProfileType.DM_LIST}
				countMember={(directMessage?.user_id?.length || 0) + 1}
				user={directMessage as ChannelMembersEntity}
			/>
			<button
				className={`group-hover/itemListDm:opacity-100 opacity-0 absolute right-2 text-gray-500 hover:text-red-500 ${isTypeDMGroup ? 'top-[22px]' : 'top-[18px]'}`}
				onClick={(e) => handleCloseClick(e, directMessage.channel_id as string)}
			>
				<Icons.Close defaultSize="size-3" />
			</button>
		</div>
	);
}

export default DMListItem;
