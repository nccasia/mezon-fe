import { useAppNavigation, useAppParams, useMessageValue } from '@mezon/core';
import {
	appActions,
	selectChannelById,
	selectClanById,
	selectCurrentChannel,
	selectCurrentStreamInfo,
	selectHashtagDmById,
	selectStatusStream,
	useAppDispatch,
	videoStreamActions
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ChannelType } from 'mezon-js';
import { memo, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ModalUnknowChannel from './ModalUnknowChannel';

type ChannelHashtagProps = {
	channelHastagId: string;
	isJumMessageEnabled: boolean;
	isTokenClickAble: boolean;
};

const ChannelHashtag = ({ channelHastagId, isJumMessageEnabled, isTokenClickAble }: ChannelHashtagProps) => {
	const dispatch = useAppDispatch();
	const { directId } = useAppParams();
	const [openModal, setOpenModal] = useState(false);
	const { clanId } = useAppParams();
	const { toChannelPage } = useAppNavigation();
	const { currentChannelId } = useMessageValue();
	const currentChannel = useSelector(selectCurrentChannel);
	const hashtagDm = useSelector(selectHashtagDmById(channelHastagId.slice(2, -1)));
	const hashtagChannel = useSelector(selectChannelById(channelHastagId.slice(2, -1)));
	const currentStreamInfo = useSelector(selectCurrentStreamInfo);
	const playStream = useSelector(selectStatusStream);
	const clanById = useSelector(selectClanById(clanId || ''));
	const getChannelPath = (channelHastagId: string, clanId: string): string | undefined => {
		if (channelHastagId.startsWith('<#') && channelHastagId.endsWith('>')) {
			return toChannelPage(channelHastagId.slice(2, -1), clanId || '');
		}
		return undefined;
	};
	const getChannelById = () => {
		if (directId !== undefined) {
			return hashtagDm;
		}
		return hashtagChannel;
	};

	const channel = getChannelById();

	const [channelPath, setChannelPath] = useState(
		getChannelPath(channelHastagId, directId !== undefined ? (channel?.clan_id ?? '') : (clanId ?? ''))
	);

	useEffect(() => {
		if (channel?.type === ChannelType.CHANNEL_TYPE_VOICE) {
			setChannelPath(getChannelPath('<#' + currentChannelId || '', directId !== undefined ? (channel?.clan_id ?? '') : (clanId ?? '') + '>'));
		} else {
			setChannelPath(getChannelPath(channelHastagId, directId !== undefined ? (channel?.clan_id ?? '') : (clanId ?? '')));
		}
	}, [currentChannelId, clanId, channelHastagId]);

	const handleClick = useCallback(() => {
		if (channel.type === ChannelType.CHANNEL_TYPE_VOICE || channel?.type === ChannelType.CHANNEL_TYPE_VOICE) {
			const urlVoice = `https://meet.google.com/${channel.meeting_code}`;
			window.open(urlVoice, '_blank', 'noreferrer');
		}
		if (channel.type === ChannelType.CHANNEL_TYPE_STREAMING) {
			if (currentStreamInfo?.streamId !== channel.id || (!playStream && currentStreamInfo?.streamId === channel.id)) {
				dispatch(
					videoStreamActions.startStream({
						clanId: clanId || '',
						clanName: clanById?.clan_name || '',
						streamId: channel?.channel_id || '',
						streamName: channel?.channel_label || ''
					})
				);
				dispatch(appActions.setIsShowChatStream(false));
			}
		}
	}, [channel, clanById, clanId, currentStreamInfo?.streamId, dispatch, playStream]);
	const tokenClickAble = () => {
		if (!isJumMessageEnabled || isTokenClickAble) {
			handleClick();
			if (channelPath) {
				setTimeout(() => {
					const channelCallElement = document.getElementById(channelPath);
					if (channelCallElement) {
						channelCallElement.scrollIntoView({ behavior: 'smooth' });
					}
				}, 0);
			}
		}
	};
	return (currentChannel?.type === ChannelType.CHANNEL_TYPE_TEXT ||
		currentChannel?.type === ChannelType.CHANNEL_TYPE_STREAMING ||
		(channelHastagId && directId)) &&
		getChannelById() ? (
		<Link
			onClick={tokenClickAble}
			style={{ textDecoration: 'none' }}
			to={!isJumMessageEnabled || isTokenClickAble ? (channelPath ?? '') : ''}
			className={`font-medium px-0.1 rounded-sm  inline whitespace-nowrap !text-[#3297ff] dark:bg-[#3C4270] bg-[#D1E0FF] ${!isJumMessageEnabled ? ' hover:bg-[#5865F2] hover:!text-white cursor-pointer ' : `hover:none cursor-text`} `}
		>
			{channel.type === ChannelType.CHANNEL_TYPE_VOICE ? (
				<Icons.Speaker
					defaultSize={`inline mt-[-0.2rem] w-4 h-4  ${isJumMessageEnabled ? 'mx-[-0.4rem]' : 'mr-0.5'} `}
					defaultFill="#3297FF"
				/>
			) : channel.type === ChannelType.CHANNEL_TYPE_STREAMING ? (
				<Icons.Stream
					defaultSize={`inline mt-[-0.2rem] w-4 h-4  ${isJumMessageEnabled ? 'mx-[-0.4rem]' : 'mr-0.5'} `}
					defaultFill="#3297FF"
				/>
			) : channel.parrent_id === '0' ? (
				<Icons.Hashtag defaultSize={`inline-block mt-[-0.5rem] w-4 h-4 ${isJumMessageEnabled ? 'mx-[-0.5rem]' : ''}`} defaultFill="#3297FF" />
			) : channel.parrent_id !== '0' ? (
				<Icons.ThreadIcon
					defaultSize={`inline-block -mt-[0.2rem] w-4 h-4 ${isJumMessageEnabled ? 'mx-[-0.5rem]' : ''}`}
					defaultFill="#3297FF"
				/>
			) : null}
			{channel.channel_label}
		</Link>
	) : (
		<>
			<span
				className="font-medium px-0.1 rounded-sm cursor-pointer inline whitespace-nowrap !text-[#3297ff] hover:!text-white dark:bg-[#3C4270] bg-[#D1E0FF] hover:bg-[#5865F2] italic"
				onClick={() => setOpenModal(true)}
			>
				# unknown
			</span>
			{openModal && <ModalUnknowChannel onClose={() => setOpenModal(false)} />}
		</>
	);
};

export default memo(ChannelHashtag);
