import { useAuth, useThreads } from '@mezon/core';
import {
	gifsStickerEmojiActions,
	messagesActions,
	reactionActions,
	referencesActions,
	selectCurrentChannel,
	selectTheme,
	threadsActions,
	useAppDispatch
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import { IMessageWithUser, SubPanelName, findParentByClass, useMenuBuilder, useMenuBuilderPlugin } from '@mezon/utils';
import { Snowflake } from '@theinternetfolks/snowflake';
import clx from 'classnames';
import { Tooltip } from 'flowbite-react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

type ChannelMessageOptProps = {
	message: IMessageWithUser;
	handleContextMenu: (event: React.MouseEvent<HTMLElement>, props: any) => void;
};

const ChannelMessageOpt = ({ message, handleContextMenu }: ChannelMessageOptProps) => {
	const currentChannel = useSelector(selectCurrentChannel);
	const refOpt = useRef<HTMLDivElement>(null);
	const checkHiddenIconThread = !currentChannel || Snowflake.isValid(currentChannel.parrent_id ?? '');
	const replyMenu = useMenuReplyMenuBuilder(message);
	const editMenu = useEditMenuBuilder(message);
	const reactMenu = useReactMenuBuilder(message);
	const threadMenu = useThreadMenuBuilder(message, checkHiddenIconThread);
	const optionMenu = useOptionMenuBuilder(handleContextMenu);
	const items = useMenuBuilder([reactMenu, replyMenu, editMenu, threadMenu, optionMenu]);
	const appearanceTheme = useSelector(selectTheme);
	const isLightMode = useMemo(() => {
		return appearanceTheme === 'light';
	}, [appearanceTheme]);

	const labelMap: Record<string, string> = {
		react: 'Add Reaction',
		reply: 'Reply',
		thread: 'Create Thread',
		edit: 'Edit'
	};
	return (
		<div
			className={`chooseForText z-[1] absolute h-8 p-0.5 rounded block ${!message.isStartedMessageGroup ? '-top-4' : message.isStartedMessageOfTheDay ? 'top-6' : '-top-1'}  right-6 w-fit h-fit `}
		>
			<div className="flex justify-between dark:bg-bgPrimary bg-bgLightMode border border-bgSecondary rounded relative">
				<div className="w-fit h-full flex justify-between" ref={refOpt}>
					{items.map((item, index) => (
						<Tooltip
							key={index}
							className="w-full h-full text-center"
							content={labelMap[item.label] || 'More'}
							trigger="hover"
							animation="duration-500"
							style={isLightMode ? 'light' : 'dark'}
						>
							<button
								onClick={(e) => (item?.handleItemClick ? item?.handleItemClick(e) : undefined)}
								className={clx('h-full p-1 cursor-pointer popup-btn', item.classNames)}
							>
								{item.icon}
							</button>
						</Tooltip>
					))}
				</div>
			</div>
		</div>
	);
};

export default memo(ChannelMessageOpt);

// Menu items plugins
// maybe should be moved to separate files
function useMenuReplyMenuBuilder(message: IMessageWithUser) {
	const dispatch = useAppDispatch();
	const { userId } = useAuth();
	const messageId = message.id;

	const handleItemClick = useCallback(() => {
		dispatch(
			referencesActions.setDataReferences({
				channelId: message.channel_id,
				dataReferences: {
					message_ref_id: message.id,
					ref_type: 0,
					message_sender_id: message.sender_id,
					content: JSON.stringify(message.content),
					message_sender_username: message.username,
					mesages_sender_avatar: message.clan_avatar ? message.clan_avatar : message.avatar,
					message_sender_clan_nick: message.clan_nick,
					message_sender_display_name: message.display_name,
					has_attachment: (message.attachments && message.attachments?.length > 0) ?? false,
					channel_id: message.channel_id ?? '',
					mode: message.mode ?? 0,
					channel_label: message.channel_label
				}
			})
		);
		dispatch(messagesActions.setIdMessageToJump(''));
		dispatch(gifsStickerEmojiActions.setSubPanelActive(SubPanelName.NONE));
	}, [dispatch, messageId]);

	return useMenuBuilderPlugin((builder) => {
		builder.when(userId !== message.sender_id, (builder) => {
			builder.addMenuItem('reply', 'reply', handleItemClick, <Icons.Reply />, null, false, false, 'rotate-180');
		});
	});
}

function useEditMenuBuilder(message: IMessageWithUser) {
	const dispatch = useAppDispatch();
	const { userId } = useAuth();
	const messageId = message.id;

	const handleItemClick = useCallback(() => {
		dispatch(reactionActions.setReactionRightState(false));
		dispatch(referencesActions.setOpenEditMessageState(true));
		dispatch(referencesActions.setIdReferenceMessageEdit(messageId));
		dispatch(
			messagesActions.setChannelDraftMessage({
				channelId: message.channel_id,
				channelDraftMessage: {
					message_id: messageId,
					draftContent: message.content,
					draftMention: message.mentions ?? [],
					draftAttachment: message.attachments ?? []
				}
			})
		);
		dispatch(messagesActions.setIdMessageToJump(''));
	}, [dispatch, message, messageId]);

	return useMenuBuilderPlugin((builder) => {
		builder.when(userId === message.sender_id, (builder) => {
			builder.addMenuItem(
				'edit',
				'edit',
				handleItemClick,
				<Icons.PenEdit className={`w-5 h-5 dark:hover:text-white hover:text-black dark:text-textSecondary text-colorTextLightMode`} />
			);
		});
	});
}

function useReactMenuBuilder(message: IMessageWithUser) {
	const dispatch = useAppDispatch();

	const handleItemClick = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			dispatch(referencesActions.setIdReferenceMessageReaction(message.id));
			dispatch(gifsStickerEmojiActions.setSubPanelActive(SubPanelName.EMOJI_REACTION_RIGHT));
			event.stopPropagation();
			const rect = (event.target as HTMLElement).getBoundingClientRect();
			const distanceToBottom = window.innerHeight - rect.bottom;

			if (distanceToBottom > 550) {
				dispatch(reactionActions.setReactionTopState(true));
			} else {
				dispatch(reactionActions.setReactionTopState(false));
			}
		},
		[dispatch]
	);

	return useMenuBuilderPlugin((builder) => {
		builder.addMenuItem('react', 'react', handleItemClick, <Icons.Smile defaultSize="w-5 h-5" />);
	});
}

function useThreadMenuBuilder(message: IMessageWithUser, isThread: boolean) {
	const [thread, setThread] = useState(false);
	const dispatch = useAppDispatch();
	const { setIsShowCreateThread, setOpenThreadMessageState, setValueThread } = useThreads();

	const handleItemClick = useCallback(() => {
		setThread(!thread);
		setIsShowCreateThread(true);
		setOpenThreadMessageState(true);
		dispatch(threadsActions.setOpenThreadMessageState(true));
		setValueThread(message);
	}, [dispatch, message, setIsShowCreateThread, setOpenThreadMessageState, setThread, thread, setValueThread]);

	return useMenuBuilderPlugin((builder) => {
		builder.when(!isThread, (builder) => {
			builder.addMenuItem('thread', 'thread', handleItemClick, <Icons.ThreadIcon isWhite={thread} />);
		});
	});
}

function useOptionMenuBuilder(handleContextMenu: any) {
	const useHandleClickOption = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			const target = event.target as HTMLElement;
			const btn = findParentByClass(target, 'popup-btn');
			const btnX = btn?.getBoundingClientRect()?.left ?? 0;
			const btnY = btn?.getBoundingClientRect()?.top ?? 0;
			const y = btnY;
			const x = btnX - 220;
			const position = { x, y };
			const props = { position };
			handleContextMenu(event, props);
		},
		[handleContextMenu]
	);

	return useMenuBuilderPlugin((builder) => {
		builder.addMenuItem('option', 'option', useHandleClickOption, <Icons.ThreeDot />);
	});
}
