import { useAppNavigation, useMemberStatus, useMenu } from '@mezon/core';
import { RootState, directActions, useAppDispatch } from '@mezon/store';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import MemberProfile from '../../MemberProfile';
export type DirectMessProp = {
	readonly directMessage: Readonly<any>;
};

function DMListItem({ directMessage }: DirectMessProp) {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const currentDmGroupId = useSelector((state: RootState) => state.direct.currentDirectMessageId);
	const pathname = useLocation().pathname;

	const { toDmGroupPage } = useAppNavigation();
	const { closeMenu, setStatusMenu } = useMenu();

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

	const userStatus = useMemberStatus(directMessage?.user_id?.length === 1 ? directMessage?.user_id[0] : '');

	return (
		<button
			key={directMessage.channel_id}
			className={`group text-[#AEAEAE] hover:text-white h-fit pl-2 rounded-[6px] dark:hover:bg-black hover:bg-[#E1E1E1] py-2 w-full dark:focus:bg-bgTertiary focus:bg-[#c7c7c7] ${directMessage.channel_id === currentDmGroupId && !pathname.includes('friends') ? 'dark:bg-[#1E1E1E] bg-[#c7c7c7] dark:text-white text-black' : ''}`}
			onClick={() => joinToChatAndNavigate(directMessage.channel_id, directMessage.type)}
		>
			<MemberProfile
				numberCharacterCollapse={22}
				avatar={
					Array.isArray(directMessage?.channel_avatar) && directMessage?.channel_avatar?.length !== 1
						? 'assets/images/avatar-group.png'
						: directMessage?.channel_avatar ?? ''
				}
				name={directMessage?.channel_label ?? ''}
				status={userStatus}
				isHideStatus={true}
				isHideIconStatus={false}
				key={directMessage.channel_id}
			/>
		</button>
	);
}

export default DMListItem;
