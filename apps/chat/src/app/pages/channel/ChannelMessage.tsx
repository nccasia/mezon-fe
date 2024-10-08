import {
	ChannelMessageOpt,
	ChatWelcome,
	MessageContextMenuProps,
	MessageWithUser,
	UnreadMessageBreak,
	useMessageContextMenu
} from '@mezon/components';
import { useSeenMessagePool } from '@mezon/core';
import {
	selectChannelDraftMessage,
	selectIdMessageRefEdit,
	selectLastSeenMessage,
	selectMessageEntityById,
	selectOpenEditMessageState,
	useAppSelector
} from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import React, {
	ForwardRefExoticComponent,
	PropsWithoutRef,
	ReactNode,
	RefAttributes,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef
} from 'react';
import { useSelector } from 'react-redux';
import MessageInput from './MessageInput';

export type MessageProps = {
	channelId: string;
	messageId: string;
	mode: number;
	isHighlight?: boolean;
	channelLabel: string;
	avatarDM?: string;
	userName?: string;
};

export type MessageRef = {
	scrollIntoView: (options?: ScrollIntoViewOptions) => void;
};

type ChannelMessageComponent = ForwardRefExoticComponent<PropsWithoutRef<MessageProps> & RefAttributes<MessageRef>> & {
	Skeleton?: () => ReactNode;
};

export const ChannelMessage: ChannelMessageComponent = React.forwardRef<MessageRef, MessageProps>(
	({ messageId, channelId, mode, channelLabel, isHighlight, avatarDM, userName }: Readonly<MessageProps>, ref) => {
		const message = useSelector((state) => selectMessageEntityById(state, channelId, messageId));
		const { markMessageAsSeen } = useSeenMessagePool();
		const openEditMessageState = useSelector(selectOpenEditMessageState);
		const idMessageRefEdit = useSelector(selectIdMessageRefEdit);
		const { showMessageContextMenu } = useMessageContextMenu();
		const channelDraftMessage = useAppSelector((state) => selectChannelDraftMessage(state, channelId));
		const messageRef = useRef<HTMLDivElement | null>(null);

		const isEditing = useMemo(() => {
			if (channelDraftMessage.message_id === messageId) {
				return openEditMessageState;
			} else {
				return openEditMessageState && idMessageRefEdit === messageId;
			}
		}, [openEditMessageState, idMessageRefEdit, channelDraftMessage.message_id, messageId]);

		const lastSeen = useSelector(selectLastSeenMessage(channelId, messageId));

		const handleContextMenu = useCallback(
			(event: React.MouseEvent<HTMLElement>, props?: Partial<MessageContextMenuProps>) => {
				showMessageContextMenu(event, messageId, mode, props);
			},
			[showMessageContextMenu, messageId, mode]
		);

		const mess = useMemo(() => {
			if (typeof message.content === 'object' && typeof (message.content as Record<string, unknown>).id === 'string') {
				return message.content;
			}
			return message;
		}, [message]);

		const editor = useMemo(() => {
			return (
				<MessageInput
					messageId={messageId}
					channelId={channelId}
					mode={mode}
					channelLabel={channelLabel}
					message={mess as IMessageWithUser}
				/>
			);
		}, [messageId, channelId, mode, channelLabel, mess]);

		const popup = useMemo(() => {
			return <ChannelMessageOpt message={message} handleContextMenu={handleContextMenu} />;
		}, [message, handleContextMenu]);

		useImperativeHandle(
			ref,
			() => ({
				scrollIntoView: (options?: ScrollIntoViewOptions) => messageRef.current?.scrollIntoView(options)
			}),
			[messageRef]
		);

		useEffect(() => {
			markMessageAsSeen(message);
		}, [markMessageAsSeen, message]);

		return (
			<>
				{message.isFirst && <ChatWelcome key={messageId} name={channelLabel} avatarDM={avatarDM} userName={userName} mode={mode} />}

				{!mess.isFirst && (
					<div ref={messageRef} className="fullBoxText relative group">
						<MessageWithUser
							allowDisplayShortProfile={true}
							message={mess as IMessageWithUser}
							mode={mode}
							isEditing={isEditing}
							isHighlight={isHighlight}
							popup={popup}
							editor={editor}
							onContextMenu={handleContextMenu}
						/>
					</div>
				)}

				{lastSeen && <UnreadMessageBreak />}
			</>
		);
	}
);

ChannelMessage.Skeleton = function () {
	return <MessageWithUser.Skeleton />;
};

export const MemorizedChannelMessage = memo(ChannelMessage);
