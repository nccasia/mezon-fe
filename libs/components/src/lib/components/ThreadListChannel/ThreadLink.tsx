import { useAppNavigation, useAppParams, useMenu, useOnClickOutside, useThreads } from '@mezon/core';
import {
	referencesActions,
	selectCloseMenu,
	selectCurrentChannel,
	selectCurrentClanId,
	selectIsUnreadChannelById,
	useAppDispatch,
} from '@mezon/store';
import { IChannel, MouseButton } from '@mezon/utils';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Coords, classes } from '../ChannelLink';
import SettingChannel from '../ChannelSetting';
import { DeleteModal } from '../ChannelSetting/Component/Modal/deleteChannelModal';
import * as Icons from '../../../../../ui/src/lib/Icons';
import PanelChannel from '../PanelChannel';

type ThreadLinkProps = {
	thread: IChannel;
	isFirstThread: boolean;
};

const ThreadLink = ({ thread, isFirstThread }: ThreadLinkProps) => {
	const dispatch = useAppDispatch();

	const { toChannelPage } = useAppNavigation();
	const { currentURL } = useAppParams();
	const currentChanel = useSelector(selectCurrentChannel);
	const clanId = useSelector(selectCurrentClanId);
	const isUnReadChannel = useSelector(selectIsUnreadChannelById(thread.id));
	const [isShowPanelChannel, setIsShowPanelChannel] = useState<boolean>(false);
	const { setIsShowCreateThread } = useThreads();

	const panelRef = useRef<HTMLAnchorElement | null>(null);
	const [openSetting, setOpenSetting] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [coords, setCoords] = useState<Coords>({
		mouseX: 0,
		mouseY: 0,
		distanceToBottom: 0,
	});

	const channelPath = toChannelPage(thread.channel_id as string, thread.clan_id || '');

	const active = currentURL === channelPath;

	const state = active ? 'active' : thread?.unread ? 'inactiveUnread' : 'inactiveRead';

	const handleMouseClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		const mouseX = event.clientX;
		const mouseY = event.clientY + window.screenY;
		const windowHeight = window.innerHeight;

		if (event.button === MouseButton.RIGHT) {
			const distanceToBottom = windowHeight - event.clientY;
			setCoords({ mouseX, mouseY, distanceToBottom });
			setIsShowPanelChannel((s) => !s);
		}
	};

	const handleDeleteChannel = () => {
		setShowModal(true);
		setIsShowPanelChannel(false);
	};

	useOnClickOutside(panelRef, () => setIsShowPanelChannel(false));

	const { setStatusMenu } = useMenu();
	const closeMenu = useSelector(selectCloseMenu);

	const { setTurnOffThreadMessage } = useThreads();
	const handleClick = (thread: IChannel) => {
		dispatch(referencesActions.setOpenEditMessageState(false));
		dispatch(referencesActions.setOpenReplyMessageState(false));
		if (currentChanel?.channel_id === thread.parrent_id) {
			setIsShowCreateThread(false, thread.parrent_id);
		}
		if (closeMenu) {
			setStatusMenu(false);
		}
	};

	return (
		<div className="flex flex-row items-center h-[34px] relative ">
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
				to={channelPath}
				key={thread.channel_id}
				className={`${classes[state]} ml-5 w-full leading-[24px] rounded font-medium dark:hover:text-white hover:text-black text-[16px] max-w-full one-line ${active || isUnReadChannel ? 'dark:font-medium font-semibold dark:text-white text-black' : 'dark:text-[#AEAEAE] text-colorTextLightMode'} ${active ? 'dark:bg-[#36373D] bg-bgLightModeButton' : ''}`}
				ref={panelRef}
				onMouseDown={(event) => handleMouseClick(event)}
				onClick={() => {
					handleClick(thread);
					setTurnOffThreadMessage();
				}}
			>
				{thread.channel_label}
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
					<DeleteModal
						onClose={() => setShowModal(false)}
						channelLabel={thread.channel_label || ''}
						channelId={thread.channel_id as string}
					/>
				)}
			</Link>
		</div>
	);
};

export default ThreadLink;
