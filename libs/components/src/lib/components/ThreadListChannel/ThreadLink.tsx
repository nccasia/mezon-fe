import { useOnClickOutside } from '@mezon/core';
import { selectCountNotifyByChannelId, selectIsUnreadChannelById } from '@mezon/store';
import { notificationActions, useAppDispatch } from '@mezon/store-mobile';
import { Icons } from '@mezon/ui';
import { IChannel, MouseButton } from '@mezon/utils';
import React, { memo, useImperativeHandle, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Coords, classes } from '../ChannelLink';
import SettingChannel from '../ChannelSetting';
import { DeleteModal } from '../ChannelSetting/Component/Modal/deleteChannelModal';
import PanelChannel from '../PanelChannel';

type ThreadLinkProps = {
	thread: IChannel;
	isFirstThread: boolean;
	isActive: boolean;
	handleClick: (thread: IChannel) => void;
};

export type ThreadLinkRef = {
	scrollToIntoView: (options?: ScrollIntoViewOptions) => void;
};

const ThreadLink = React.forwardRef<ThreadLinkRef, ThreadLinkProps>(({ thread, isFirstThread, isActive, handleClick }: ThreadLinkProps, ref) => {
	const numberNotification = useSelector(selectCountNotifyByChannelId(thread.id));
	const isUnReadChannel = useSelector(selectIsUnreadChannelById(thread.id));
	const [isShowPanelChannel, setIsShowPanelChannel] = useState<boolean>(false);
	const dispatch = useAppDispatch();

	const panelRef = useRef<HTMLDivElement | null>(null);
	const threadLinkRef = useRef<HTMLAnchorElement | null>(null);
	const [openSetting, setOpenSetting] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [coords, setCoords] = useState<Coords>({
		mouseX: 0,
		mouseY: 0,
		distanceToBottom: 0
	});

	const channelPath = `/chat/clans/${thread.clan_id}/channels/${thread.channel_id}`;

	const state = isActive ? 'active' : thread?.unread ? 'inactiveUnread' : 'inactiveRead';

	useImperativeHandle(ref, () => ({
		scrollToIntoView: (options?: ScrollIntoViewOptions) => {
			threadLinkRef.current?.scrollIntoView(options);
		}
	}));

	const handleMouseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const mouseX = event.clientX;
		const mouseY = event.clientY;
		const windowHeight = window.innerHeight;

		if (event.button === MouseButton.RIGHT) {
			const distanceToBottom = windowHeight - event.clientY;
			setCoords({ mouseX, mouseY, distanceToBottom });
			setIsShowPanelChannel((s) => !s);
		}
		dispatch(notificationActions.removeNotificationsByChannelId(thread.channel_id ?? ''));
	};

	const handleDeleteChannel = () => {
		setShowModal(true);
		setIsShowPanelChannel(false);
	};

	useOnClickOutside(panelRef, () => setIsShowPanelChannel(false));

	return (
		<div
			className="flex flex-row items-center h-[34px] relative "
			ref={panelRef}
			role={'button'}
			onMouseDown={(event) => handleMouseClick(event)}
		>
			{isFirstThread ? (
				<span className="absolute top-2 left-0">
					<Icons.ShortCorner />
				</span>
			) : (
				<span className="absolute top-[-16px] left-[1px]">
					<Icons.LongCorner />
				</span>
			)}

			<Link
				ref={threadLinkRef}
				to={channelPath}
				key={thread.channel_id}
				className={`${classes[state]} ml-5 w-full leading-[24px] rounded font-medium dark:hover:text-white hover:text-black text-[16px] max-w-full one-line ${isActive || isUnReadChannel ? 'dark:font-medium font-semibold dark:text-white text-black' : ' dark:text-channelTextLabel text-colorTextLightMode'} ${isActive ? 'dark:bg-[#36373D] bg-bgLightModeButton' : ''}`}
				onClick={() => {
					handleClick(thread);
				}}
			>
				{thread.channel_label}
			</Link>

			{isShowPanelChannel && (
				<PanelChannel
					onDeleteChannel={handleDeleteChannel}
					channel={thread}
					coords={coords}
					setOpenSetting={setOpenSetting}
					setIsShowPanelChannel={setIsShowPanelChannel}
				/>
			)}

			{openSetting && (
				<SettingChannel
					onClose={() => {
						setOpenSetting(false);
					}}
					channel={thread}
				/>
			)}

			{showModal && (
				<DeleteModal onClose={() => setShowModal(false)} channelLabel={thread.channel_label || ''} channelId={thread.channel_id as string} />
			)}

			{numberNotification !== 0 && (
				<div className="absolute ml-auto w-4 h-4 top-[9px] text-white right-3 group-hover:hidden bg-red-600 flex justify-center items-center rounded-full text-xs font-medium">
					{numberNotification}
				</div>
			)}
		</div>
	);
});
export default memo(ThreadLink, (next, curr) => {
	return next.isActive === curr.isActive && next.isFirstThread === curr.isFirstThread && next.thread === curr.thread;
});
