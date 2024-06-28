import { ChannelMessageOpt, MessageWithUser, UnreadMessageBreak } from '@mezon/components';
import {
	selectIdMessageRefEdit,
	selectLastSeenMessage,
	selectMemberByUserId,
	selectMessageEntityById,
	selectOpenEditMessageState,
} from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { useSeenMessagePool } from '@mezon/core';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import MessageInput from './MessageInput';
import ModalDeleteMess from './ModalDeleteMess';
import { useDeleteMessageHook } from './useDeleteMessage';
import { useMessageContextMenu } from './MessageContextMenuContext';

type MessageProps = {
	channelId: string;
	messageId: string;
	mode: number;
	channelLabel: string;
};

export function ChannelMessage({ messageId, channelId, mode, channelLabel }: Readonly<MessageProps>) {
	const message = useSelector((state) => selectMessageEntityById(state, channelId, messageId));
	const { markMessageAsSeen } = useSeenMessagePool();
	const user = useSelector(selectMemberByUserId(message.sender_id));
	const { deleteMessage, setDeleteMessage } = useDeleteMessageHook(channelId, channelLabel, mode);
	const openEditMessageState = useSelector(selectOpenEditMessageState);
	const idMessageRefEdit = useSelector(selectIdMessageRefEdit);
	const { showMessageContextMenu, preloadMessageContextMenu } = useMessageContextMenu();

	const isEditing = useMemo(() => {
		return openEditMessageState && idMessageRefEdit === messageId;
	}, [openEditMessageState, idMessageRefEdit, messageId]);

	const lastSeen = useSelector(selectLastSeenMessage(channelId, messageId));

	const handleContextMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
		showMessageContextMenu(event, messageId);
	}, [showMessageContextMenu, messageId]);

	const mess = useMemo(() => {
		if (typeof message.content === 'object' && typeof (message.content as Record<string, unknown>).id === 'string') {
			return message.content;
		}
		return message;
	}, [message]);

	const editor = useMemo(() => {
		return <MessageInput messageId={messageId} channelId={channelId} mode={mode} channelLabel={channelLabel} message={mess as IMessageWithUser} />
	}, [messageId, channelId, mode, channelLabel, mess]);

	const popup = useMemo(() => {
		return <ChannelMessageOpt message={message} handleContextMenu={handleContextMenu} />
	}, [message, handleContextMenu]);

	useEffect(() => {
		markMessageAsSeen(message);
	}, [markMessageAsSeen, message]);

	useEffect(() => {
		preloadMessageContextMenu(messageId);
	}, [preloadMessageContextMenu, messageId]);

	return (
		<>
			<div className="fullBoxText relative group">
				<MessageWithUser
					isEditing={isEditing}
					popup={popup}
					editor={editor}
					message={mess as IMessageWithUser}
					user={user} mode={mode} 
					onContextMenu={handleContextMenu}
				/>
			</div>
			{lastSeen && <UnreadMessageBreak />}
			{deleteMessage && <ModalDeleteMess mode={mode} closeModal={() => setDeleteMessage(false)} mess={message} />}
		</>
	);
}

ChannelMessage.Skeleton = () => (
	<div>
		<MessageWithUser.Skeleton />
	</div>
);

export const MemorizedChannelMessage = memo(ChannelMessage);
