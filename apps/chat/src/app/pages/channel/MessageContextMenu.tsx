import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { Icons } from '@mezon/components';
import { useAuth, useClanRestriction } from '@mezon/core';
import {
	selectCurrentChannelId,
	selectMessageByMessageId,
	selectPinMessageByChannelId,
	selectReactionOnMessageList,
	useAppDispatch,
} from '@mezon/store';
import { ContextMenuItem, EPermission, MenuBuilder } from '@mezon/utils';
import 'react-contexify/ReactContexify.css';
import { useSelector } from 'react-redux';
import DynamicContextMenu from './DynamicContextMenu';

type MessageContextMenuProps = {
	id: string;
	messageId: string;
	imgTarget?: boolean | HTMLImageElement | null;
};

function MessageContextMenu({ id, imgTarget, messageId }: MessageContextMenuProps) {
	const currentChannelId = useSelector(selectCurrentChannelId);
	const reactionRealtimeList = useSelector(selectReactionOnMessageList);
	const listPinMessages = useSelector(selectPinMessageByChannelId(currentChannelId));
	const message = useSelector(selectMessageByMessageId(messageId));
	const dispatch = useAppDispatch();
	const { userId } = useAuth();
	const checkMessageInRealtimeList = useCallback((arrayMessageIdReaction: string[], messageId: string) => {
		return arrayMessageIdReaction.includes(messageId);
	}, []);
	const messageHasReaction = useMemo(() => {
		return message.reactions && message?.reactions?.length > 0 ? true : false;
	}, [message?.reactions?.length]);
	const [checkAdmintrator, { isClanCreator }] = useClanRestriction([EPermission.administrator]);
	const checkSenderMessage = useMemo(() => {
		return message?.sender_id === userId;
	}, [message.sender_id, userId]);

	const checkMessageHasText = useMemo(() => {
		return message?.content.t !== '';
	}, [message?.content.t]);

	const checkMessageHasReaction = useCallback(() => {
		const checkRealtime = checkMessageInRealtimeList(reactionRealtimeList, message.id);
		if (!messageHasReaction && !checkRealtime) {
			return false;
		} else {
			return true;
		}
	}, [messageHasReaction, reactionRealtimeList, checkMessageInRealtimeList]);

	const checkMessageInPinneList = listPinMessages.some((pinMessage) => pinMessage.message_id === messageId);
	const [pinMessage, unPinMessage] = useClanRestriction([EPermission.manageChannel]);
	const [delMessage, reportMessage] = useClanRestriction([EPermission.manageChannel]);
	const [removeOneReaction] = useClanRestriction([EPermission.manageChannel]);
	const [removeAllReactions] = useClanRestriction([EPermission.manageChannel]);

	const [createThread] = useClanRestriction([EPermission.manageChannel]);
	const [isAllowDelMessage] = useClanRestriction([EPermission.deleteMessage]);
	const [isAllowCreateThread] = useClanRestriction([EPermission.manageThread]);
	//
	const [enableDelMessageItem, setEnableDelMessageItem] = useState<boolean>(false);
	const [enableEditMessageItem, setEnableEditMessageItem] = useState<boolean>(false);
	const [enableSpeakMessageItem, setEnableSpeakMessageItem] = useState<boolean>(false);
	const [enablePinMessageItem, setEnablePinMessageItem] = useState<boolean>(false);
	const [enableUnPinMessageItem, setEnableUnPinMessageItem] = useState<boolean>(false);
	const [enableCreateThreadItem, setEnableCreateThreadItem] = useState<boolean>(false);
	const [enableViewReactionItem, setEnableViewReactionItem] = useState<boolean>(false);
	const [enableRemoveOneReactionItem, setEnableRemoveOneReactionItem] = useState<boolean>(false);
	const [enableRemoveAllReactionItem, setEnableRemoveAllReactionsItem] = useState<boolean>(false);
	const [enableReportMessageItem, setEnableReportMessageItem] = useState<boolean>(false);

	// 2. allow view reaction
	useLayoutEffect(() => {
		setEnableViewReactionItem(checkMessageHasReaction());
	}, [checkMessageHasReaction()]);

	// 3. allow edit/report message
	useLayoutEffect(() => {
		setEnableEditMessageItem(checkSenderMessage);
		setEnableReportMessageItem(!checkSenderMessage);
	}, [checkSenderMessage]);

	// 4. allow pin message
	useLayoutEffect(() => {
		if (!pinMessage && !isClanCreator && !checkAdmintrator) {
			setEnablePinMessageItem(pinMessage);
		}
	}, [pinMessage, isClanCreator, checkAdmintrator]);

	// 4. allow unpin message
	useLayoutEffect(() => {
		if (pinMessage && unPinMessage && checkMessageInPinneList) {
			setEnablePinMessageItem(false);
			setEnableUnPinMessageItem(true);
		}
	}, [unPinMessage, checkMessageInPinneList, pinMessage]);

	// 5. allow speak message
	useLayoutEffect(() => {
		setEnableSpeakMessageItem(checkMessageHasText);
	}, [checkMessageHasText]);

	// 6. allow remove one reaction
	useLayoutEffect(() => {
		setEnableRemoveOneReactionItem(checkMessageHasReaction());
	}, [removeOneReaction, checkMessageHasReaction()]);

	// 7. allow remove all reactions
	useLayoutEffect(() => {
		setEnableRemoveAllReactionsItem(checkMessageHasReaction());
	}, [removeAllReactions, checkMessageHasReaction()]);

	// 8. allow thread item
	useLayoutEffect(() => {
		console.log(createThread, isAllowCreateThread);
		if (!createThread && !isAllowCreateThread && !isClanCreator && !checkAdmintrator) {
			setEnableCreateThreadItem(false);
		} else {
			setEnableCreateThreadItem(true);
		}
	}, [createThread, isAllowCreateThread, isClanCreator, checkAdmintrator]);

	// 10. allow delete message
	useLayoutEffect(() => {
		if (!delMessage && !isAllowDelMessage && !checkSenderMessage) {
			setEnableDelMessageItem(false);
		} else {
			setEnableDelMessageItem(true);
		}
	}, [delMessage, isAllowDelMessage, checkSenderMessage]);

	const items = useMemo<ContextMenuItem[]>(() => {
		const builder = new MenuBuilder();

		builder.addMenuItem(
			'addReaction', // id
			'Add Reaction', // lable
			() => console.log('add reacte'), // callback
			<Icons.RightArrowRightClick />, // icon
			null, // sub menu
			false, // has sub menu?
			false, // disable ?
		);

		builder.when(enableViewReactionItem, (builder) => {
			builder.addMenuItem('viewReaction', 'View Reaction');
		});

		builder.when(enableEditMessageItem, (builder) => {
			builder.addMenuItem('editMessage', 'Edit Message');
		});

		builder.when(enablePinMessageItem, (builder) => {
			builder.addMenuItem('pinMessage', 'Pin Message');
		});
		builder.when(enableUnPinMessageItem, (builder) => {
			builder.addMenuItem('unPinMessage', 'Unpin Message');
		});

		builder.addMenuItem('reply', 'Reply');

		builder.when(enableCreateThreadItem, (builder) => {
			builder.addMenuItem('createThread', 'Create Thread');
		});

		builder.addMenuItem('copyText', 'Copy Text');
		builder.addMenuItem('apps', 'Apps');
		builder.addMenuItem('markUnread', 'Mark Unread');
		builder.addMenuItem('copyMessageLink', 'Copy Message Link');
		builder.addMenuItem('forwardMessage', 'Forward Message');

		builder.when(enableSpeakMessageItem, (builder) => {
			builder.addMenuItem('speakMessage', 'Speak Message');
		});

		builder.when(enableRemoveOneReactionItem, (builder) => {
			builder.addMenuItem('removeReactions', 'Remove Reactions');
		});
		builder.when(enableRemoveAllReactionItem, (builder) => {
			builder.addMenuItem('removeAllReactions', 'Remove All Reactions');
		});

		builder.when(enableDelMessageItem, (builder) => {
			builder.addMenuItem('deleteMessage', 'Delete Message');
		});
		builder.when(enableReportMessageItem, (builder) => {
			builder.addMenuItem('reportMessage', 'Report Message');
		});

		return builder.build();
	}, [
		dispatch,
		messageId,
		imgTarget,
		enableViewReactionItem,
		enableEditMessageItem,
		enablePinMessageItem,
		enableUnPinMessageItem,
		enableCreateThreadItem,
		enableSpeakMessageItem,
		enableRemoveOneReactionItem,
		enableRemoveAllReactionItem,
		enableDelMessageItem,
    enableReportMessageItem
	]);

	return <DynamicContextMenu menuId={id} items={items} />;
}

export default MessageContextMenu;

// builder.when(isAllowPinMessage, (builder) => {
// 	builder.addMenuItem('pinMessage', 'Pin Message');
// 	builder.addMenuItem('unPinMessage', 'Unpin Message');
// 	builder.addSeparator();
// });

// builder.when(isSender, (builder) => {
// 	builder.addMenuItem('editMessage', 'Edit Message', () => {
// 		dispatch(referencesActions.setOpenReplyMessageState(false));
// 		dispatch(referencesActions.setOpenEditMessageState(true));
// 		dispatch(messagesActions.setOpenOptionMessageState(false));
// 		dispatch(referencesActions.setIdReferenceMessageEdit(messageId));
// 	});
// });

// builder.when(couldDelete, (builder) => {
// 	builder.addMenuItem('deleteMessage', 'Delete Message');
// });

// builder.addMenuItem('removeReaction', 'Remove Reactions');
// builder.addMenuItem('removeAllReactions', 'Remove All Reactions');
// builder.addSeparator();

// builder.addMenuItem('reportMessage', 'Report Message');
// builder.addSeparator();

// builder.addMenuItem('viewReactions', 'View Reactions');
// builder.addSeparator();

// builder.when(!!imgTarget, (builder) => {
// 	builder.addMenuItem('copyImage', 'Copy Image');
// 	builder.addMenuItem('saveImage', 'Save Image');
// });
