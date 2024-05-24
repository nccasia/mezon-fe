import { useAppNavigation, useAppParams, useAuth, useClans, useMenu, useOnClickOutside, useReference, useThreads } from '@mezon/core';
import { channelsActions, useAppDispatch, voiceActions } from '@mezon/store';
import { ChannelStatusEnum, IChannel, getVoiceChannelName } from '@mezon/utils';
import { useMezonVoice } from '@mezon/voice';
import { ChannelType } from 'mezon-js';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SettingChannel from '../ChannelSetting';
import { DeleteModal } from '../ChannelSetting/Component/Modal/deleteChannelModal';
import * as Icons from '../Icons';
import { AddPerson, SettingProfile } from '../Icons';
import PanelChannel from '../PanelChannel';

export type ChannelLinkProps = {
	clanId?: string;
	channel: IChannel;
	createInviteLink: (clanId: string, channelId: string) => void;
	isPrivate?: number;
	isUnReadChannel?: boolean;
	numberNotication?: number;
	channelType?: number;
};

export type Coords = {
	mouseX: number;
	mouseY: number;
	distanceToBottom: number;
};

export const classes = {
	active: 'flex flex-row items-center px-2 mx-2 rounded relative p-1',
	inactiveUnread: 'flex flex-row items-center px-2 mx-2 rounded relative p-1 dark:hover:bg-bgModifierHover hover:bg-bgLightModeButton',
	inactiveRead: 'flex flex-row items-center px-2 mx-2 rounded relative p-1 dark:hover:bg-bgModifierHover hover:bg-bgLightModeButton',
};

function ChannelLink({ clanId, channel, isPrivate, createInviteLink, isUnReadChannel, numberNotication, channelType }: ChannelLinkProps) {
	const { userProfile } = useAuth();
	const { currentClan } = useClans();
	const voice = useMezonVoice();

	const [openSetting, setOpenSetting] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isShowPanelChannel, setIsShowPanelChannel] = useState<boolean>(false);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const [coords, setCoords] = useState<Coords>({
		mouseX: 0,
		mouseY: 0,
		distanceToBottom: 0,
	});

	const { setReferenceMessage, setOpenReplyMessageState, setOpenEditMessageState } = useReference();

	const handleOpenCreate = () => {
		setOpenSetting(true);
		setIsShowPanelChannel(false);
	};

	const { toChannelPage } = useAppNavigation();
	const { currentURL } = useAppParams();

	const channelPath = toChannelPage(channel.id, channel?.clan_id ?? '');

	const state = currentURL === channelPath ? 'active' : channel?.unread ? 'inactiveUnread' : 'inactiveRead';

	const handleCreateLinkInvite = () => {
		createInviteLink(clanId ?? '', channel.channel_id ?? '');
		setIsShowPanelChannel(false);
	};

	const handleMouseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const mouseX = event.clientX;
		const mouseY = event.clientY + window.screenY;
		const windowHeight = window.innerHeight;

		if (event.button === 2) {
			const distanceToBottom = windowHeight - event.clientY;
			setCoords({ mouseX, mouseY, distanceToBottom });
			setIsShowPanelChannel((s) => !s);
		}
	};

	useOnClickOutside(panelRef, () => setIsShowPanelChannel(false));
	const dispatch = useAppDispatch();

	const handleVoiceChannel = (id: string) => {
		const voiceChannelName = getVoiceChannelName(currentClan?.clan_name, channel.channel_label);
		voice.setVoiceOptions((prev) => ({
			...prev,
			voiceChannelName: voiceChannelName
		}));

		dispatch(channelsActions.setCurrentVoiceChannelId(id));
		dispatch(voiceActions.setStatusCall(true));
	};

	const handleDeleteChannel = () => {
		setShowModal(true);
		setIsShowPanelChannel(false);
	};

	const { closeMenu, setStatusMenu } = useMenu();
	const { setTurnOffThreadMessage } = useThreads();
	const handleClick = () => {
		setTurnOffThreadMessage();
		setReferenceMessage(null);
		setOpenEditMessageState(false);
		setOpenReplyMessageState(false);
		if (closeMenu) {
			setStatusMenu(false);
		}
	};
	return (
		<div ref={panelRef} onMouseDown={(event) => handleMouseClick(event)} role="button" className="relative group">
			{channelType === ChannelType.CHANNEL_TYPE_VOICE ? (
				<span
					className={`${classes[state]} cursor-pointer ${currentURL === channelPath ? 'dark:bg-bgModifierHover bg-bgModifierHoverLight' : ''}`}
					onClick={() => handleVoiceChannel(channel.id)}
					role="link"
				>
					{state === 'inactiveUnread' && <div className="absolute left-0 -ml-2 w-1 h-2 bg-white rounded-r-full"></div>}
					<div className="relative mt-[-5px]">
						{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_VOICE && (
							<Icons.SpeakerLocked defaultSize="w-5 h-5" />
						)}
						{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_TEXT && (
							<Icons.HashtagLocked defaultSize="w-5 h-5 " />
						)}
						{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_VOICE && <Icons.Speaker defaultSize="w-5 5-5" />}
						{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_TEXT && <Icons.Hashtag defaultSize="w-5 h-5" />}
					</div>
					<p
						className={`ml-2 w-full dark:group-hover:text-white group-hover:text-black text-base focus:bg-bgModifierHover ${currentURL === channelPath || isUnReadChannel ? 'dark:text-white text-black dark:font-medium font-semibold' : 'font-medium dark:text-[#AEAEAE] text-colorTextLightMode'}`}
						title={channel.channel_label && channel?.channel_label.length > 20 ? channel?.channel_label : undefined}
					>
						{channel.channel_label && channel?.channel_label.length > 20
							? `${channel?.channel_label.substring(0, 20)}...`
							: channel?.channel_label}
					</p>
				</span>
			) : (
				<Link to={channelPath} onClick={handleClick}>
					<span className={`${classes[state]} ${currentURL === channelPath ? 'dark:bg-bgModifierHover bg-bgLightModeButton' : ''}`}>
						{state === 'inactiveUnread' && <div className="absolute left-0 -ml-2 w-1 h-2 bg-white rounded-r-full"></div>}
						<div className="relative mt-[-5px]">
							{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_VOICE && (
								<Icons.SpeakerLocked defaultSize="w-5 h-5" />
							)}
							{isPrivate === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_TEXT && (
								<Icons.HashtagLocked defaultSize="w-5 h-5 " />
							)}
							{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_VOICE && <Icons.Speaker defaultSize="w-5 5-5" />}
							{isPrivate === undefined && channel.type === ChannelType.CHANNEL_TYPE_TEXT && <Icons.Hashtag defaultSize="w-5 h-5" />}
						</div>
						<p
							className={`ml-2 w-full dark:group-hover:text-white group-hover:text-black text-base focus:bg-bgModifierHover ${currentURL === channelPath || isUnReadChannel ? 'dark:text-white text-black dark:font-medium font-semibold' : 'font-medium dark:text-[#AEAEAE] text-colorTextLightMode'}`}
							title={channel.channel_label && channel?.channel_label.length > 20 ? channel?.channel_label : undefined}
						>
							{channel.channel_label && channel?.channel_label.length > 20
								? `${channel?.channel_label.substring(0, 20)}...`
								: channel?.channel_label}
						</p>
					</span>
				</Link>
			)}

			{currentClan?.creator_id === userProfile?.user?.id ? (
				numberNotication !== 0 ? (
					<>
						<AddPerson
							className={`absolute ml-auto w-4 h-4  top-[6px] right-8 cursor-pointer hidden group-hover:block dark:text-white text-black ${currentURL === channelPath ? '' : ''}`}
							onClick={handleCreateLinkInvite}
						/>
						<SettingProfile
							className={`absolute ml-auto w-4 h-4  top-[6px] right-3 cursor-pointer hidden group-hover:block dark:text-white text-black ${currentURL === channelPath ? '' : ''}`}
							onClick={handleOpenCreate}
						/>
						<div
							className={`absolute ml-auto w-4 h-4 text-white right-3 group-hover:hidden bg-red600 rounded-full text-xs text-center top-2`}
						>
							{numberNotication}
						</div>
					</>
				) : (
					<>
						<AddPerson
							className={`absolute ml-auto w-4 h-4 top-[6px] group-hover:block dark:group-hover:text-white group-hover:text-black ${currentURL === channelPath ? 'dark:text-white text-black' : 'text-transparent'} block right-8 cursor-pointer`}
							onClick={handleCreateLinkInvite}
						/>
						<SettingProfile
							className={`absolute ml-auto w-4 h-4 top-[6px] right-3 ${currentURL === channelPath ? 'dark:text-white text-black' : 'text-transparent'} block group-hover:block dark:group-hover:text-white group-hover:text-black cursor-pointer`}
							onClick={handleOpenCreate}
						/>
					</>
				)
			) : (
				<>
					<AddPerson
						className={`absolute ml-auto w-4 h-4  top-[6px] group-hover:block dark:group-hover:text-white group-hover:text-black  ${currentURL === channelPath ? 'dark:text-white text-black' : 'text-transparent'} hidden right-3 cursor-pointer`}
						onClick={handleCreateLinkInvite}
					/>
					{numberNotication !== 0 && (
						<div className="absolute ml-auto w-4 h-4 top-[9px] text-white right-3 group-hover:hidden bg-red-600 flex justify-center items-center rounded-full text-xs">
							{numberNotication}
						</div>
					)}
				</>
			)}

			<SettingChannel
				open={openSetting}
				onClose={() => {
					setOpenSetting(false);
				}}
				channel={channel}
			/>
			{/* <p>{numberNotication}</p> */}
			{isShowPanelChannel && (
				<PanelChannel
					onDeleteChannel={handleDeleteChannel}
					channel={channel}
					coords={coords}
					setOpenSetting={setOpenSetting}
					setIsShowPanelChannel={setIsShowPanelChannel}
				/>
			)}

			{showModal && (
				<DeleteModal
					onClose={() => setShowModal(false)}
					channelLable={channel.channel_label || ''}
					channelId={channel.channel_id as string}
				/>
			)}
		</div>
	);
}

export default ChannelLink;
