import { useEscapeKey, useMemberStatus, useMenu, useOnClickOutside } from '@mezon/core';
import {
	DirectEntity,
	appActions,
	selectCloseMenu,
	selectDmGroupCurrent,
	selectIsShowMemberListDM,
	selectIsUseProfileDM,
	selectStatusMenu,
	selectTheme,
	useAppDispatch
} from '@mezon/store';
import { Tooltip } from 'flowbite-react';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useCallback, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import * as Icons from '../../../../../../ui/src/lib/Icons/index';
import { HelpButton, InboxButton } from '../../ChannelTopbar';
import PinnedMessages from '../../ChannelTopbar/TopBarComponents/PinnedMessages';
import MemberProfile from '../../MemberProfile';
import SearchMessageChannel from '../../SearchMessageChannel';
import CreateMessageGroup from '../CreateMessageGroup';
import LabelDm from './labelDm';

export type ChannelTopbarProps = {
	readonly dmGroupId?: Readonly<string>;
};

function DmTopbar({ dmGroupId }: ChannelTopbarProps) {
	const dispatch = useAppDispatch();
	const currentDmGroup = useSelector(selectDmGroupCurrent(dmGroupId ?? ''));
	const userStatus = useMemberStatus(currentDmGroup?.user_id?.length === 1 ? currentDmGroup?.user_id[0] : '');
	const { setStatusMenu } = useMenu();
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const isShowMemberListDM = useSelector(selectIsShowMemberListDM);
	const appearanceTheme = useSelector(selectTheme);
	const isUseProfileDM = useSelector(selectIsUseProfileDM);
	const setIsUseProfileDM = useCallback(
		async (status: boolean) => {
			await dispatch(appActions.setIsUseProfileDM(status));
		},
		[dispatch]
	);

	const setIsShowMemberListDM = useCallback(
		async (status: boolean) => {
			await dispatch(appActions.setIsShowMemberListDM(status));
		},
		[dispatch]
	);

	return (
		<div
			className={`flex h-heightTopBar p-3 min-w-0 items-center dark:bg-bgPrimary bg-bgLightPrimary shadow border-b-[1px] dark:border-bgTertiary border-bgLightTertiary flex-shrink`}
		>
			<div className="sbm:justify-start justify-between items-center gap-1 flex w-full">
				<div className="flex flex-row gap-1 items-center flex-1">
					<div onClick={() => setStatusMenu(true)} className={`mx-6 ${closeMenu && !statusMenu ? '' : 'hidden'}`} role="button">
						<Icons.OpenMenu defaultSize={`w-5 h-5`} />
					</div>
					<MemberProfile
						numberCharacterCollapse={22}
						avatar={
							Number(currentDmGroup?.type) === ChannelType.CHANNEL_TYPE_GROUP
								? 'assets/images/avatar-group.png'
								: (currentDmGroup?.channel_avatar?.at(0) ?? '')
						}
						name={currentDmGroup?.usernames || `${currentDmGroup?.creator_name}'s Group`}
						status={userStatus}
						isHideStatus={true}
						isHideIconStatus={false}
						key={currentDmGroup?.channel_id}
						isHiddenAvatarPanel={true}
					/>
					<LabelDm dmGroupId={dmGroupId || ''} currentDmGroup={currentDmGroup} />
				</div>

				<div className=" items-center h-full ml-auto hidden justify-end ssm:flex">
					<div className=" items-center gap-2 flex">
						<div className="justify-start items-center gap-[15px] flex">
							<button>
								<Tooltip
									content="Start voice call"
									trigger="hover"
									animation="duration-500"
									style={appearanceTheme === 'light' ? 'light' : 'dark'}
								>
									<Icons.IconPhoneDM />
								</Tooltip>
							</button>
							<button>
								<Tooltip
									content="Start Video Call"
									trigger="hover"
									animation="duration-500"
									style={appearanceTheme === 'light' ? 'light' : 'dark'}
								>
									<Icons.IconMeetDM />
								</Tooltip>
							</button>
							<div>
								<PinButton isLightMode={appearanceTheme === 'light'} />
							</div>
							<AddMemberToGroupDm currentDmGroup={currentDmGroup} appearanceTheme={appearanceTheme} />
							{currentDmGroup?.type === ChannelType.CHANNEL_TYPE_GROUP && (
								<button onClick={() => setIsShowMemberListDM(!isShowMemberListDM)}>
									<Tooltip
										content="Show Member List"
										trigger="hover"
										animation="duration-500"
										style={appearanceTheme === 'light' ? 'light' : 'dark'}
									>
										<Icons.MemberList isWhite={isShowMemberListDM} />
									</Tooltip>
								</button>
							)}
							{currentDmGroup?.type === ChannelType.CHANNEL_TYPE_DM && (
								<button onClick={() => setIsUseProfileDM(!isUseProfileDM)}>
									<Tooltip
										content="Show User Profile"
										trigger="hover"
										animation="duration-500"
										style={appearanceTheme === 'light' ? 'light' : 'dark'}
									>
										<Icons.IconUserProfileDM />
									</Tooltip>
								</button>
							)}
						</div>
						<SearchMessageChannel
							mode={
								currentDmGroup?.type === ChannelType.CHANNEL_TYPE_DM
									? ChannelStreamMode.STREAM_MODE_DM
									: ChannelStreamMode.STREAM_MODE_GROUP
							}
						/>
						<div
							className={`gap-4 relative flex  w-[82px] h-8 justify-center items-center left-[345px] ssm:left-auto ssm:right-0`}
							id="inBox"
						>
							<InboxButton />
							<HelpButton />
						</div>
					</div>
				</div>
				{currentDmGroup?.type === ChannelType.CHANNEL_TYPE_GROUP && (
					<button onClick={() => setIsShowMemberListDM(!isShowMemberListDM)} className="sbm:hidden">
						<Tooltip
							content="Show Member List"
							trigger="hover"
							animation="duration-500"
							style={appearanceTheme === 'light' ? 'light' : 'dark'}
						>
							<Icons.MemberList isWhite={isShowMemberListDM} />
						</Tooltip>
					</button>
				)}
				{currentDmGroup?.type === ChannelType.CHANNEL_TYPE_DM && (
					<button onClick={() => setIsUseProfileDM(!isUseProfileDM)} className="sbm:hidden">
						<Tooltip
							content="Show User Profile"
							trigger="hover"
							animation="duration-500"
							style={appearanceTheme === 'light' ? 'light' : 'dark'}
						>
							<Icons.IconUserProfileDM />
						</Tooltip>
					</button>
				)}
			</div>
		</div>
	);
}

function PinButton({ isLightMode }: { isLightMode: boolean }) {
	const [isShowPinMessage, setIsShowPinMessage] = useState<boolean>(false);
	const threadRef = useRef<HTMLDivElement | null>(null);

	const handleShowPinMessage = () => {
		setIsShowPinMessage(!isShowPinMessage);
	};

	useOnClickOutside(threadRef, () => setIsShowPinMessage(false));
	useEscapeKey(() => setIsShowPinMessage(false));
	return (
		<div className="relative leading-5 h-5" ref={threadRef}>
			<Tooltip
				className={`${isShowPinMessage && 'hidden'} w-[142px]`}
				content="Pinned Messages"
				trigger="hover"
				animation="duration-500"
				style={isLightMode ? 'light' : 'dark'}
			>
				<button className="focus-visible:outline-none" onClick={handleShowPinMessage} onContextMenu={(e) => e.preventDefault()}>
					<Icons.PinRight isWhite={isShowPinMessage} />
				</button>
			</Tooltip>
			{isShowPinMessage && <PinnedMessages />}
		</div>
	);
}

const AddMemberToGroupDm = ({ currentDmGroup, appearanceTheme }: { currentDmGroup: DirectEntity; appearanceTheme: string }) => {
	const [openAddToGroup, setOpenAddToGroup] = useState<boolean>(false);
	const handleOpenAddToGroupModal = () => {
		setOpenAddToGroup(!openAddToGroup);
	};
	const modalAddMemRef = useRef<HTMLDivElement | null>(null);
	useOnClickOutside(modalAddMemRef, () => setOpenAddToGroup(false));
	return (
		<div onClick={handleOpenAddToGroupModal} ref={modalAddMemRef}>
			{openAddToGroup && (
				<div className="relative top-4 cursor-pointer">
					<CreateMessageGroup
						currentDM={currentDmGroup}
						isOpen={openAddToGroup}
						onClose={handleOpenAddToGroupModal}
						classNames="right-0 left-auto"
					/>
				</div>
			)}
			<Tooltip content="Add friends to DM" trigger="hover" animation="duration-500" style={appearanceTheme === 'light' ? 'light' : 'dark'}>
				<Icons.IconAddFriendDM />
			</Tooltip>
		</div>
	);
};

DmTopbar.Skeleton = () => {
	return (
		<div className="flex  h-heightTopBar min-w-0 items-center bg-bgSecondary border-b border-black px-3 pt-4 pb-6 flex-shrink">
			<Skeleton width={38} height={38} />
		</div>
	);
};

export default DmTopbar;
