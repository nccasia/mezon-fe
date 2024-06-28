import { Icons } from '@mezon/components';

export const AddReaction = () => <Icons.RightArrowRightClick />;
export const Reply = () => <Icons.ReplyRightClick />;
export const CreateThread = () => <Icons.ThreadIconRightClick />;
export const CopyText = () => <Icons.CopyTextRightClick />;
export const App = () => <Icons.RightArrowRightClick />;
export const MarkUnread = () => <Icons.UnreadRightClick />;
export const CopyMessageLink = () => <Icons.CopyMessageLinkRightClick />;
export const PinMessage = () => <Icons.PinMessageRightClick />;
export const UnPinMessage = () => <Icons.PinMessageRightClick />;
export const SpeakingMessage = () => <Icons.SpeakMessageRightClick />;
export const EditMessage = () => <Icons.EditMessageRightClick />;
export const DeleteMessage = () => <Icons.DeleteMessageRightClick />;
export const RemoveReactions = () => <Icons.RightArrowRightClick />;
export const ViewReactions = () => <Icons.ViewReactionRightClick />;
export const ReportMessage = () => <Icons.ReportMessageRightClick />;
export const ForwardMessage = () => <Icons.ForwardRightClick />;

export const imageList = [
	{ name: 'Copy Image', symbol: <></> },
	{ name: 'Save Image', symbol: <></> },
];

export const linkList = [
	{ name: 'Copy Link', symbol: <></> },
	{ name: 'Open Link', symbol: <></> },
];

export const listClickDefault = [
	{ id: 0, name: 'Add Reaction', symbol: <AddReaction /> },
	{ id: 5, name: 'Reply', symbol: <Reply /> },
	{ id: 6, name: 'Create Thread', symbol: <CreateThread /> },
	{ id: 7, name: 'Copy Text', symbol: <CopyText /> },
	{ id: 8, name: 'Apps', symbol: <App /> },
	{ id: 9, name: 'Mark Unread', symbol: <MarkUnread /> },
	{ id: 10, name: 'Copy Message Link', symbol: <CopyMessageLink /> },
	{ id: 11, name: 'Forward Message', symbol: <ForwardMessage /> },
];

export const pinMessageList = [{ id: 3, name: 'Pin Message', symbol: <PinMessage /> }];

export const unPinMessageList = [{ id: 4, name: 'Unpin Message', symbol: <UnPinMessage /> }];

export const speakMessageList = [{ id: 12, name: 'Speak Message', symbol: <SpeakingMessage /> }];

export const editMessageList = [{ id: 2, name: 'Edit Message', symbol: <EditMessage /> }];

export const deleteMessageList = [{ id: 15, name: 'Delete Message', symbol: <DeleteMessage /> }];

export const removeReactionList = [{ id: 13, name: 'Remove Reactions', symbol: <RemoveReactions /> }];

export const removeAllReactionList = [{ id: 14, name: 'Remove All Reactions', symbol: <></> }];

export const reportMessageList = [{ id: 16, name: 'Report Message', symbol: <ReportMessage /> }];

export const viewReactionList = [{ id: 1, name: 'View Reactions', symbol: <ViewReactions /> }];
