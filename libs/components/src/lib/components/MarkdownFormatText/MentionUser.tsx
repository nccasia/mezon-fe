import { useOnClickOutside } from '@mezon/core';
import { selectAllChannelMembers, selectAllRolesClan, selectAllUsesClan } from '@mezon/store';
import { MouseButton, checkLastChar, getRoleList } from '@mezon/utils';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ShortUserProfile from '../ShortUserProfile/ShortUserProfile';

type ChannelHashtagProps = {
	tagName: string;
	tagUserId: string;
	mode?: number;
	isJumMessageEnabled: boolean;
	isTokenClickAble: boolean;
};

const MentionUser = ({ tagName, mode, isJumMessageEnabled, isTokenClickAble, tagUserId }: ChannelHashtagProps) => {
	const panelRef = useRef<HTMLAnchorElement>(null);
	const usersClan = useSelector(selectAllUsesClan);
	const usersInChannel = useSelector(selectAllChannelMembers);
	const [foundUser, setFoundUser] = useState<any>(null);
	const dispatchUserIdToShowProfile = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		e.stopPropagation();
		e.preventDefault();
	};

	const rolesInClan = useSelector(selectAllRolesClan);
	const roleList = getRoleList(rolesInClan);

	const matchingRole = useMemo(() => {
		return roleList.find((role) => `@${role.roleName}` === tagName);
	}, [tagName]);

	const [userRemoveChar, setUserRemoveChar] = useState('');
	const username = tagName.slice(1);
	useEffect(() => {
		if (checkLastChar(username)) {
			setUserRemoveChar(username.slice(0, -1));
		} else {
			setUserRemoveChar(username);
		}
		let user;
		if (mode === 4 || mode === 3) {
			user = usersInChannel.find((channelUsers) => channelUsers.user?.id === tagUserId);
		} else {
			user = usersClan.find((userClan) => userClan.user?.id === tagUserId);
		}

		if (user) {
			setFoundUser(user);
		} else {
			setFoundUser(null);
		}
	}, [tagName, userRemoveChar, mode, usersInChannel, usersClan]);

	const [showProfileUser, setIsShowPanelChannel] = useState(false);
	const [positionBottom, setPositionBottom] = useState(false);
	const [positionTop, setPositionTop] = useState(0);
	const [positionLeft, setPositionLeft] = useState(0);

	const handleMouseClick = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
		if (event.button === MouseButton.LEFT && tagName !== '@here') {
			setIsShowPanelChannel(true);
			const clickY = event.clientY;
			const windowHeight = window.innerHeight;
			const distanceToBottom = windowHeight - clickY;
			const windowWidth = window.innerWidth;
			const elementTagName = event.target;
			if (elementTagName instanceof HTMLElement) {
				const positionRight = elementTagName.getBoundingClientRect().right;
				const widthElement = elementTagName.offsetWidth;
				const widthElementShortUserProfileMin = 380;
				const distanceToRight = windowWidth - positionRight;
				if (distanceToRight < widthElementShortUserProfileMin) {
					setPositionLeft(positionRight - widthElement - widthElementShortUserProfileMin);
				} else {
					setPositionLeft(positionRight + 20);
				}
				setPositionTop(clickY - 50);
				setPositionBottom(false);
			}
			const heightElementShortUserProfileMin = 313;
			if (distanceToBottom < heightElementShortUserProfileMin) {
				setPositionBottom(true);
			}
		}
	};
	useOnClickOutside(panelRef, () => setIsShowPanelChannel(false));
	return (
		<>
			{showProfileUser && (
				<div
					className="dark:bg-black bg-gray-200 mt-[10px] w-[300px] rounded-lg flex flex-col z-10 fixed opacity-100"
					style={{
						left: `${positionLeft}px`,
						top: positionBottom ? '' : `${positionTop}px`,
						bottom: positionBottom ? '64px' : '',
					}}
					onMouseDown={(e) => e.stopPropagation()}
				>
					<ShortUserProfile userID={foundUser.user.id} mode={mode} />
				</div>
			)}

			{foundUser !== null || tagName === '@here' ? (
				<>
					<Link
						onMouseDown={!isJumMessageEnabled || isTokenClickAble ? (event) => handleMouseClick(event) : () => {}}
						ref={panelRef}
						onClick={!isJumMessageEnabled || isTokenClickAble ? (e) => dispatchUserIdToShowProfile(e) : () => {}}
						style={{ textDecoration: 'none' }}
						to={''}
						className={`font-medium px-0.1 rounded-sm 
				${tagName === '@here' ? 'cursor-text' : isJumMessageEnabled ? 'cursor-pointer hover:!text-white' : 'hover:none'}

				 whitespace-nowrap !text-[#3297ff]  dark:bg-[#3C4270] bg-[#D1E0FF]  ${isJumMessageEnabled ? 'hover:bg-[#5865F2]' : 'hover:none'}`}
					>
						{foundUser?.user?.username ? tagName : '@here'}
					</Link>
					{`${checkLastChar(username) ? `${username.charAt(username.length - 1)}` : ''}`}
				</>
			) : matchingRole ? (
				<span className="font-medium px-[0.1rem] rounded-sm bg-[#E3F1E4] hover:bg-[#B1E0C7] text-[#0EB08C] dark:bg-[#3D4C43] dark:hover:bg-[#2D6457]">{`@${matchingRole.roleName}`}</span>
			) : (
				<span>{tagName}</span>
			)}
		</>
	);
};

export default memo(MentionUser);
