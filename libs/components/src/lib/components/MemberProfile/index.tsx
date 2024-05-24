import { ShortUserProfile } from '@mezon/components';
import { useChannelMembers, useOnClickOutside } from '@mezon/core';
import { ChannelMembersEntity } from '@mezon/store';
import { useRef, useState } from 'react';
import { Coords } from '../ChannelLink';
import { OfflineStatus, OnlineStatus } from '../Icons';
import PanelMember from '../PanelMember';
import ModalRemoveMemberClan from './ModalRemoveMemberClan';
export type MemberProfileProps = {
	avatar: string;
	name: string;
	status?: boolean;
	isHideStatus?: boolean;
	isHideIconStatus?: boolean;
	numberCharacterCollapse?: number;
	textColor?: string;
	isHideUserName?: boolean;
	classParent?: string;
	user?: ChannelMembersEntity;
	listProfile?: boolean;
	isOffline?: boolean;
	isHideAnimation?: boolean;
};

function MemberProfile({
	avatar,
	name,
	status,
	isHideStatus,
	isHideIconStatus,
	numberCharacterCollapse = 6,
	textColor = 'contentSecondary',
	isHideUserName,
	classParent = '',
	user,
	listProfile,
	isOffline,
	isHideAnimation,
}: MemberProfileProps) {
	const [isShowUserProfile, setIsShowUserProfile] = useState<boolean>(false);
	const [isShowPanelMember, setIsShowPanelMember] = useState<boolean>(false);
	const [positionTop, setPositionTop] = useState(false);
	const [top, setTop] = useState(0);
	const [coords, setCoords] = useState<Coords>({
		mouseX: 0,
		mouseY: 0,
		distanceToBottom: 0,
	});
	const [openModalRemoveMember, setOpenModalRemoveMember] = useState<boolean>(false);

	const { removeMemberChannel } = useChannelMembers();

	const panelRef = useRef<HTMLDivElement | null>(null);

	const handleMouseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const mouseX = event.clientX;
		const mouseY = event.clientY;
		const windowHeight = window.innerHeight;

		const distanceToBottom = windowHeight - mouseY;

		if (event.button === 0) {
			console.log(1);
			setIsShowUserProfile(true);
			const heightElementShortUserProfileMin = 313;
			setTop(mouseY - 50);
			if (distanceToBottom < heightElementShortUserProfileMin) {
				setPositionTop(true);
			}
		}
		if (event.button === 2) {
			setCoords({ mouseX, mouseY, distanceToBottom });
			setIsShowPanelMember(!isShowPanelMember);
		}
	};

	const handleDefault = (e: any) => {
		e.stopPropagation();
	};

	const handleClosePannelMember = () => {
		setIsShowPanelMember(false);
	};

	const handleClickRemoveMember = () => {
		setOpenModalRemoveMember(true);
		setIsShowPanelMember(false);
		setIsShowUserProfile(false);
	};

	const handleRemoveMember = async (value: string) => {
		if (user) {
			const ids = [user.user?.id ?? ''];
			await removeMemberChannel({ channelId: user.channelId as string, ids });

			setOpenModalRemoveMember(false);
		}
	};

	const handleClickOutSide = () => {
		setIsShowUserProfile(false);
		setIsShowPanelMember(false);
	};

	useOnClickOutside(panelRef, handleClickOutSide);

	return (
		<div className="relative group">
			<div
				ref={panelRef}
				onMouseDown={(event) => handleMouseClick(event)}
				className={`relative gap-[5px] flex items-center cursor-pointer rounded ${classParent} ${isOffline ? 'opacity-60' : ''} ${listProfile ? '' : 'overflow-hidden'}`}
			>
				<a className="mr-[2px] relative inline-flex items-center justify-start w-10 h-10 text-lg text-white rounded-full">
					{avatar ? (
						<img src={avatar} className="w-[38px] h-[38px] min-w-[38px] rounded-full object-cover" />
					) : (
						<div className="w-[38px] h-[38px] bg-bgDisable rounded-full flex justify-center items-center text-contentSecondary text-[16px]">
							{name.charAt(0).toUpperCase()}
						</div>
					)}
					{!isHideIconStatus && avatar !== '/assets/images/avatar-group.png' ? (
						<span
							className={`absolute bottom-[-1px] right-[-1px] inline-flex items-center justify-center gap-1 p-[3px] text-sm text-white dark:bg-[#111] bg-bgLightMode rounded-full`}
						>
							{status ? <OnlineStatus /> : <OfflineStatus />}
						</span>
					) : (
						<></>
					)}
				</a>
				<div className="flex flex-col items-start">
					<div
						className={`absolute top-6 transition-all duration-300 flex flex-col items-start ${isHideAnimation ? '' : 'group-hover:-translate-y-4'}`}
					>
						{!isHideStatus && (
							<>
								<span className={`text-[11px] dark:text-contentSecondary text-colorTextLightMode`}>
									{!status ? 'Offline' : 'Online'}
								</span>
								<p className="text-[11px] dark:text-contentSecondary text-colorTextLightMode">{name}</p>
							</>
						)}
					</div>
					{!isHideUserName && (
						<p
							className={`text-base font-medium text-colorTextLightMode dark:text-white ${classParent == '' ? 'bg-transparent' : 'relative top-[-7px]'} nameMemberProfile`}
							title={name && name.length > numberCharacterCollapse ? name : undefined}
						>
							{name && name.length > numberCharacterCollapse ? `${name.substring(0, numberCharacterCollapse)}...` : name}
						</p>
					)}
				</div>
			</div>
			{isShowPanelMember && (
				<PanelMember coords={coords} onClose={handleClosePannelMember} member={user} onRemoveMember={handleClickRemoveMember} />
			)}
			{isShowUserProfile && listProfile ? (
				<div
					className={`dark:bg-black bg-gray-200 mt-[10px]  rounded-lg flex flex-col z-10 opacity-100 shortUserProfile fixed right-[245px] w-[360px]`}
					style={{ bottom: positionTop ? '15px' : '', top: positionTop ? '' : `${top}px` }}
					onMouseDown={handleDefault}
					onClick={(e) => e.stopPropagation()}
				>
					<ShortUserProfile userID={user?.user?.id || ''} />
				</div>
			) : null}

			{openModalRemoveMember && (
				<ModalRemoveMemberClan
					openModal={openModalRemoveMember}
					username={user?.user?.username}
					onClose={() => setOpenModalRemoveMember(false)}
					onRemoveMember={handleRemoveMember}
				/>
			)}
		</div>
	);
}

export default MemberProfile;
