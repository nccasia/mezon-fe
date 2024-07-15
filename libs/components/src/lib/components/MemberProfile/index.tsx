import { Icons, ShortUserProfile } from '@mezon/components';
import { useChannelMembers, useOnClickOutside } from '@mezon/core';
import { ChannelMembersEntity, selectAllAccount, selectCurrentClan, selectCurrentClanId } from '@mezon/store';
import { MemberProfileType, MouseButton } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Coords } from '../ChannelLink';
import { directMessageValueProps } from '../DmList/DMListItem';
import { OfflineStatus, OnlineStatus } from '../../../../../ui/src/lib/Icons';
import PanelMember from '../PanelMember';
import ModalRemoveMemberClan from './ModalRemoveMemberClan';
import { DataMemberCreate } from '../DmList/MemberListGroupChat';
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
	isUnReadDirect?: boolean;
	directMessageValue?: directMessageValueProps;
	isMemberGroupDm?: boolean;
	positionType?: MemberProfileType;
	countMember?: number;
	dataMemberCreate?: DataMemberCreate;
	isHiddenAvatarPanel?: boolean;
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
	isUnReadDirect,
	directMessageValue,
	isMemberGroupDm,
	positionType,
	countMember,
	dataMemberCreate,
	isHiddenAvatarPanel,
}: MemberProfileProps) {
	const [isShowUserProfile, setIsShowUserProfile] = useState<boolean>(false);
	const [isShowPanel, setIsShowPanel] = useState<boolean>(false);
	const [positionTop, setPositionTop] = useState(false);
	const [top, setTop] = useState(0);
	const [coords, setCoords] = useState<Coords>({
		mouseX: 0,
		mouseY: 0,
		distanceToBottom: 0,
	});
	const [openModalRemoveMember, setOpenModalRemoveMember] = useState<boolean>(false);

	const { removeMemberClan } = useChannelMembers();
	const currentClanId = useSelector(selectCurrentClanId);
	const currentClan = useSelector(selectCurrentClan);
	const userProfile = useSelector(selectAllAccount);

	const panelRef = useRef<HTMLDivElement | null>(null);

	const handleMouseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		// stop open popup default of web
		window.oncontextmenu = (e) => {
			e.preventDefault();
		};
		const mouseX = event.clientX;
		const mouseY = event.clientY;
		const windowHeight = window.innerHeight;

		const distanceToBottom = windowHeight - mouseY;

		if (event.button === MouseButton.LEFT) {
			setIsShowUserProfile(true);
			const heightElementShortUserProfileMin = 313;
			setTop(mouseY - 50);
			if (distanceToBottom < heightElementShortUserProfileMin) {
				setPositionTop(true);
			}
		}
		if (event.button === MouseButton.RIGHT) {
			setCoords({ mouseX, mouseY, distanceToBottom });
			setIsShowPanel(!isShowPanel);
		}
	};

	const handleDefault = (e: any) => {
		e.stopPropagation();
	};

	const handleClosePannelMember = () => {
		setIsShowPanel(false);
	};

	const handleClickRemoveMember = () => {
		setOpenModalRemoveMember(true);
		setIsShowPanel(false);
		setIsShowUserProfile(false);
	};

	const handleRemoveMember = async (value: string) => {
		if (user) {
			const userIds = [user.user?.id ?? ''];
			await removeMemberClan({ clanId: currentClanId as string, channelId: user.channelId as string, userIds });

			setOpenModalRemoveMember(false);
		}
	};

	const handleClickOutSide = () => {
		setIsShowUserProfile(false);
		setIsShowPanel(false);
	};

	useOnClickOutside(panelRef, handleClickOutSide);

	return (
		<div className="relative group" >
			<div
				ref={panelRef}
				onMouseDown={(event) => handleMouseClick(event)}
				className={`relative gap-[5px] flex items-center cursor-pointer rounded ${positionType === MemberProfileType.FOOTER_PROFILE ? 'h-10 max-w-[142px]' : ''} ${classParent} ${isOffline ? 'opacity-60' : ''} ${listProfile ? '' : 'overflow-hidden'}`}
			>
				<a className="mr-[2px] relative inline-flex items-center justify-start w-8 h-8 text-lg text-white rounded-full">
					{avatar ? (
						<img src={avatar} className="w-[32px] h-[32px] min-w-[32px] rounded-full object-cover" />
					) : (
						<div className="w-[32px] h-[32px] bg-bgDisable rounded-full flex justify-center items-center text-contentSecondary text-[16px]">
							{(userProfile?.user?.username || name).charAt(0).toUpperCase()}
						</div>
					)}
					{!isHideIconStatus && avatar !== 'assets/images/avatar-group.png' ? (
						<span
							className={`absolute bottom-[0px] right-[-4px] inline-flex items-center justify-center gap-1 p-[3px] text-sm text-white dark:bg-bgSecondary bg-bgLightMode rounded-full`}
						>
							{status ? <OnlineStatus /> : <OfflineStatus />}
						</span>
					) : (
						<></>
					)}
				</a>
				<div className="flex flex-col items-start">
					<div
						className={`absolute top-[22px] max-w-[102px] overflow-x-hidden transition-all duration-300 flex flex-col items-start ${isHideAnimation ? '' : 'group-hover:-translate-y-4'}`}
					>
						{!isHideStatus && (
							<>
								<span className={`text-[11px] dark:text-contentSecondary text-colorTextLightMode`}>
									{!status ? 'Offline' : 'Online'}
								</span>
								<p className="text-[11px] dark:text-contentSecondary text-colorTextLightMode overflow-x-hidden whitespace-nowrap text-ellipsis w-full">
									{userProfile?.user?.username}
								</p>
							</>
						)}
					</div>
					{!isHideUserName && (
						<div className="flex flex-row items-center w-full overflow-x-hidden">
							<p
								className={`text-base font-medium nameMemberProfile
                  ${positionType === MemberProfileType.FOOTER_PROFILE ? 'leading-[26px] max-w-[102px] whitespace-nowrap overflow-x-hidden text-ellipsis' : ''}
                  ${positionType === MemberProfileType.MEMBER_LIST ? 'max-w-[140px] whitespace-nowrap overflow-x-hidden text-ellipsis' : ''}
                  ${positionType === MemberProfileType.DM_LIST ? 'max-w-[176px] whitespace-nowrap overflow-x-hidden text-ellipsis' : ''}
                  ${classParent == '' ? 'bg-transparent' : 'relative top-[-7px] dark:bg-transparent bg-channelTextareaLight'}
                  ${isUnReadDirect ? 'dark:text-white text-black dark:font-medium font-semibold' : 'font-medium dark:text-[#AEAEAE] text-colorTextLightMode'}
							`}
								title={name}
							>
								{name}
							</p>
							{((dataMemberCreate?.createId || currentClan?.creator_id) && (dataMemberCreate ? dataMemberCreate?.createId : currentClan?.creator_id) === user?.user?.id) && (
								<button className="w-[14px] h-[14px] ml-1">
									<Icons.OwnerIcon />
								</button>
							)}
						</div>
					)}

					{Number(directMessageValue?.type) === ChannelType.CHANNEL_TYPE_GROUP && (
						<p className="dark:text-[#AEAEAE] text-colorTextLightMode text-xs">{countMember} Members</p>
					)}
				</div>
			</div>
			{(isShowPanel && !isHiddenAvatarPanel) && (
				<PanelMember coords={coords} onClose={handleClosePannelMember} member={user} onRemoveMember={handleClickRemoveMember} directMessageValue={directMessageValue} name={name} isMemberDMGroup={dataMemberCreate ? true : false} dataMemberCreate={dataMemberCreate}/>
			)}
			{isShowUserProfile && listProfile ? (
				<div
					className={`dark:bg-black bg-gray-200 mt-[10px] rounded-lg flex flex-col z-10 opacity-100 shortUserProfile fixed md:right-[245px] right-auto left-5 sbm:left-[185px] md:left-auto w-[300px] max-w-[89vw]`}
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
