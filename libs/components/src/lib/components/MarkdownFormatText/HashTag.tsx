import { useAppNavigation, useAppParams, useMessageValue } from '@mezon/core';
import { ChannelsEntity, selectChannelById, selectCurrentChannel, selectHashtagDmVoiceById } from '@mezon/store';
import { ChannelType } from 'mezon-js';
import { memo, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Icons } from '../../components';
import ModalUnknowChannel from './ModalUnknowChannel';

type ChannelHashtagProps = {
	channelHastagId: string;
	isJumMessageEnabled: boolean;
	isTokenClickAble: boolean;
};

const ChannelHashtag = ({ channelHastagId, isJumMessageEnabled, isTokenClickAble }: ChannelHashtagProps) => {
	const { directId } = useAppParams();
	const [openModal, setOpenModal] = useState(false);
	const { clanId } = useAppParams();
	const { toChannelPage } = useAppNavigation();
	const { currentChannelId } = useMessageValue();
	const currentChannel = useSelector(selectCurrentChannel);
	const getChannelPath = (channelHastagId: string, clanId: string): string | undefined => {
		if (channelHastagId.startsWith('<#') && channelHastagId.endsWith('>')) {
			return toChannelPage(channelHastagId.slice(2, -1), clanId || '');
		}
		return undefined;
	};
	const getChannelById = (channelHastagId: string) => {
		let channel: ChannelsEntity;
		if (directId !== undefined) {
			channel = useSelector(selectHashtagDmVoiceById(directId + channelHastagId));
		} else {
			channel = useSelector(selectChannelById(channelHastagId));
		}
		return channel;
	};

	const [channelPath, setChannelPath] = useState(getChannelPath(channelHastagId, clanId ?? ''));

	const channel = getChannelById(channelHastagId.slice(2, -1));

	useEffect(() => {
		if (channel?.type === ChannelType.CHANNEL_TYPE_VOICE) {
			setChannelPath(getChannelPath('<#' + currentChannelId || '', clanId || '' + '>'));
		} else {
			setChannelPath(getChannelPath(channelHastagId, clanId ?? ''));
		}
	}, [channel, currentChannelId, clanId, channelHastagId]);

	const handleClick = useCallback(() => {
		if (channel.type === ChannelType.CHANNEL_TYPE_VOICE || (channelHastagId && directId)) {
			const urlVoice = `https://meet.google.com/${channel.meeting_code}`;
			window.open(urlVoice, '_blank', 'noreferrer');
		}
	}, [channel]);

	return (currentChannel?.type === ChannelType.CHANNEL_TYPE_TEXT || (channelHastagId && directId)) &&
		getChannelById(channelHastagId.slice(2, -1)) ? (
		<Link
			onClick={!isJumMessageEnabled || isTokenClickAble ? handleClick : () => {}}
			style={{ textDecoration: 'none' }}
			to={!isJumMessageEnabled || isTokenClickAble ? (channelPath ?? '') : ''}
			className={`font-medium px-0.1 rounded-sm  inline whitespace-nowrap !text-[#3297ff] dark:bg-[#3C4270] bg-[#D1E0FF] ${!isJumMessageEnabled ? ' hover:bg-[#5865F2] hover:!text-white cursor-pointer ' : `hover:none cursor-text`} `}
		>
			{channel.type === ChannelType.CHANNEL_TYPE_VOICE || (channelHastagId && directId) ? (
				<Icons.Speaker
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
