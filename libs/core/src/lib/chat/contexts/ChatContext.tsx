import {
	ChannelMessageEvent,
	ChannelPresenceEvent,
	MessageReactionEvent,
	MessageTypingEvent,
	Notification,
	StatusPresenceEvent,
	VoiceJoinedEvent,
} from '@mezon/mezon-js';
import {
	DataVoiceSocketOptinals,
	channelMembersActions,
	friendsActions,
	mapMessageChannelToEntity,
	messagesActions,
	useAppDispatch,
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageWithUser, TabNamePopup } from '@mezon/utils';
import React, { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSeenMessagePool } from '../hooks/useSeenMessagePool';

type ChatContextProviderProps = {
	children: React.ReactNode;
};

export type ChatContextValue = {
	messageRef: IMessageWithUser | undefined;
	setMessageRef: React.Dispatch<React.SetStateAction<IMessageWithUser | undefined>>;
	isOpenReply: boolean;
	setIsOpenReply: React.Dispatch<React.SetStateAction<boolean>>;

	isOpenEdit: boolean;
	setIsOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;

	isOpenEmojiMessBox: boolean;
	setIsOpenEmojiMessBox: React.Dispatch<React.SetStateAction<boolean>>;

	emojiSelectedReacted: string;
	setEmojiSelectedReacted: React.Dispatch<React.SetStateAction<string>>;

	emojiSelectedMess: string;
	setEmojiSelectedMess: React.Dispatch<React.SetStateAction<string>>;

	isOpenEmojiReacted: boolean;
	setIsOpenEmojiReacted: React.Dispatch<React.SetStateAction<boolean>>;
	isOpenEmojiReactedBottom: boolean;
	setIsOpenEmojiReactedBottom: React.Dispatch<React.SetStateAction<boolean>>;

	emojiPlaceActive: string;
	setEmojiPlaceActive: React.Dispatch<React.SetStateAction<string>>;

	widthEmojiBar: number;
	setWidthEmojiBar: React.Dispatch<React.SetStateAction<number>>;

	activeTab: string;
	setActiveTab: React.Dispatch<React.SetStateAction<string>>;

	heightEditor: number;
	setHeightEditor: React.Dispatch<React.SetStateAction<number>>;

	valueInput: string;
	setValueInput: React.Dispatch<React.SetStateAction<string>>;

	userJoinedVoiceChannel: DataVoiceSocketOptinals;
	setUserJoinedVoiceChannel: React.Dispatch<React.SetStateAction<DataVoiceSocketOptinals>>;

	userJoinedVoiceChannelList: DataVoiceSocketOptinals[];
	setUserJoinedVoiceChannelList: React.Dispatch<React.SetStateAction<DataVoiceSocketOptinals[]>>;

	voiceChannelMemberList: DataVoiceSocketOptinals[];
	setVoiceChannelMemberList: React.Dispatch<React.SetStateAction<DataVoiceSocketOptinals[]>>;
};

const ChatContext = React.createContext<ChatContextValue>({} as ChatContextValue);

const ChatContextProvider: React.FC<ChatContextProviderProps> = ({ children }) => {
	const [messageRef, setMessageRef] = React.useState<IMessageWithUser>();
	const [isOpenReply, setIsOpenReply] = React.useState<boolean>(false);
	const [isOpenEdit, setIsOpenEdit] = React.useState<boolean>(false);
	const [isOpenEmojiMessBox, setIsOpenEmojiMessBox] = React.useState<boolean>(false);
	const [emojiSelectedReacted, setEmojiSelectedReacted] = React.useState<string>('');
	const [emojiSelectedMess, setEmojiSelectedMess] = React.useState<string>('');
	const [isOpenEmojiReacted, setIsOpenEmojiReacted] = React.useState<boolean>(false);
	const [isOpenEmojiReactedBottom, setIsOpenEmojiReactedBottom] = React.useState<boolean>(false);
	const [emojiPlaceActive, setEmojiPlaceActive] = React.useState<string>('');
	const [widthEmojiBar, setWidthEmojiBar] = React.useState<number>(0);
	const [activeTab, setActiveTab] = React.useState<string>(TabNamePopup.NONE);
	const [heightEditor, setHeightEditor] = React.useState<number>(50);
	const [valueInput, setValueInput] = React.useState<string>('');
	const [userJoinedVoiceChannel, setUserJoinedVoiceChannel] = React.useState<DataVoiceSocketOptinals>({});
	const [userJoinedVoiceChannelList, setUserJoinedVoiceChannelList] = React.useState<DataVoiceSocketOptinals[]>([]);
	const [voiceChannelMemberList, setVoiceChannelMemberList] = React.useState<DataVoiceSocketOptinals[]>([]);

	const value = React.useMemo<ChatContextValue>(
		() => ({
			messageRef,
			setMessageRef,
			isOpenReply,
			setIsOpenReply,
			isOpenEdit,
			setIsOpenEdit,
			isOpenEmojiMessBox,
			setIsOpenEmojiMessBox,
			emojiSelectedReacted,
			setEmojiSelectedReacted,
			isOpenEmojiReacted,
			setIsOpenEmojiReacted,
			emojiPlaceActive,
			setEmojiPlaceActive,
			emojiSelectedMess,
			setEmojiSelectedMess,
			widthEmojiBar,
			setWidthEmojiBar,
			isOpenEmojiReactedBottom,
			setIsOpenEmojiReactedBottom,
			activeTab,
			setActiveTab,
			heightEditor,
			setHeightEditor,
			valueInput,
			setValueInput,
			userJoinedVoiceChannel,
			setUserJoinedVoiceChannel,
			userJoinedVoiceChannelList,
			setUserJoinedVoiceChannelList,
			voiceChannelMemberList,
			setVoiceChannelMemberList,
		}),
		[
			messageRef,
			setMessageRef,
			isOpenReply,
			setIsOpenReply,
			isOpenEdit,
			setIsOpenEdit,
			isOpenEmojiMessBox,
			setIsOpenEmojiMessBox,
			emojiSelectedReacted,
			setEmojiSelectedReacted,
			isOpenEmojiReacted,
			setIsOpenEmojiReacted,
			emojiPlaceActive,
			setEmojiPlaceActive,
			emojiSelectedMess,
			setEmojiSelectedMess,
			widthEmojiBar,
			setWidthEmojiBar,
			isOpenEmojiReactedBottom,
			setIsOpenEmojiReactedBottom,
			activeTab,
			setActiveTab,
			heightEditor,
			setHeightEditor,
			valueInput,
			setValueInput,
			userJoinedVoiceChannel,
			setUserJoinedVoiceChannel,
			userJoinedVoiceChannelList,
			setUserJoinedVoiceChannelList,
			voiceChannelMemberList,
			setVoiceChannelMemberList,
		],
	);

	const { socketRef, reconnect } = useMezon();
	const { userId } = useAuth();
	const { initWorker, unInitWorker } = useSeenMessagePool();
	const dispatch = useAppDispatch();

	const onvoicejoined = useCallback(
		(voice: VoiceJoinedEvent) => {
			const voiceEventJoined = voice as any;
			if (voiceEventJoined) {
				setUserJoinedVoiceChannel({
					clanId: voiceEventJoined.clan_id,
					clanName: voiceEventJoined.clan_name,
					id: voiceEventJoined.id,
					lastScreenshot: voiceEventJoined.last_screenshot,
					participant: voiceEventJoined.participant,
					userId: voiceEventJoined.user_id,
					voiceChannelId: voiceEventJoined.voice_channel_id,
					voiceChannelLable: voiceEventJoined.voice_channel_label,
				});
				if (userJoinedVoiceChannel) {
					userJoinedVoiceChannelList.push(userJoinedVoiceChannel);
				}
				dispatch(
					messagesActions.pushMemberToVoiceChannelData({
						clanId: voiceEventJoined.clan_id,
						clanName: voiceEventJoined.clan_name,
						id: voiceEventJoined.id,
						lastScreenshot: voiceEventJoined.last_screenshot,
						participant: voiceEventJoined.participant,
						userId: voiceEventJoined.user_id,
						voiceChannelId: voiceEventJoined.voice_channel_id,
						voiceChannelLable: voiceEventJoined.voice_channel_label,
					}),
				);
			}
		},
		[dispatch],
	);

	const onvoiceleaved = useCallback(
		(voice: VoiceJoinedEvent) => {
			const voiceEventLeaved = voice as any;
			console.log('onvoiceleaved', voiceEventLeaved);
			// dispatch(voiceActions.remove(voiceEventLeaved.id));
		},
		[dispatch],
	);

	const onchannelmessage = useCallback(
		(message: ChannelMessageEvent) => {
			dispatch(messagesActions.newMessage(mapMessageChannelToEntity(message)));
		},
		[dispatch],
	);

	const onchannelpresence = useCallback(
		(channelPresence: ChannelPresenceEvent) => {
			dispatch(channelMembersActions.fetchChannelMembersPresence(channelPresence));
		},
		[dispatch],
	);

	const onstatuspresence = useCallback(
		(statusPresence: StatusPresenceEvent) => {
			dispatch(channelMembersActions.updateStatusUser(statusPresence));
		},
		[dispatch],
	);

	const onnotification = useCallback(
		(notification: Notification) => {
			if (notification.code === -2 || notification.code === -3) {
				dispatch(friendsActions.fetchListFriends());
				toast.info(notification.subject);
			}
		},
		[dispatch],
	);
	const ondisconnect = useCallback(() => {
		const retry = (attempt: number) => {
			console.log('Reconnecting', attempt);
			const delay = Math.min(100 * Math.pow(2, attempt), 30000); // Exponential backoff with maximum delay of 30 seconds
			setTimeout(() => {
				reconnect()
					.then(() => {
						console.log('Reconnected');
					})
					.catch(() => {
						retry(attempt + 1);
					});
			}, delay);
		};
		retry(0);
	}, [reconnect]);

	const onerror = useCallback((event: unknown) => {
		// TODO: handle error
		console.log(event);
	}, []);

	const onmessagetyping = useCallback(
		(e: MessageTypingEvent) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const event = e as any;
			if (event && event.sender_id === userId) {
				return;
			}

			dispatch(
				messagesActions.updateTypingUsers({
					channelId: event.channel_id,
					userId: event.sender_id,
					isTyping: true,
				}),
			);
		},
		[dispatch, userId],
	);

	const onmessagereaction = useCallback(
		(e: MessageReactionEvent) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const event = e as any;
			if (event) {
				dispatch(
					messagesActions.updateReactionMessage({
						id: event.id,
						channelId: event.channel_id,
						messageId: event.message_id,
						emoji: event.emoji,
						count: event.count,
						userId: event.sender_id,
						actionRemove: event?.action,
					}),
				);
			}
		},
		[dispatch],
	);

	useEffect(() => {
		const socket = socketRef.current;
		if (!socket) {
			return;
		}

		socket.onvoicejoined = onvoicejoined;

		socket.onvoiceleaved = onvoiceleaved;

		socket.onchannelmessage = onchannelmessage;

		socket.onchannelpresence = onchannelpresence;

		socket.ondisconnect = ondisconnect;

		socket.onerror = onerror;

		socket.onmessagetyping = onmessagetyping;

		socket.onmessagereaction = onmessagereaction;

		socket.onnotification = onnotification;

		socket.onstatuspresence = onstatuspresence;

		return () => {
			socket.onvoicejoined = () => {};
			socket.onvoiceleaved = () => {};
			socket.onchannelmessage = () => {};
			socket.onchannelpresence = () => {};
			socket.onnotification = () => {};
			socket.onstatuspresence = () => {};
			socket.ondisconnect = () => {};
		};
	}, [
		onvoicejoined,
		onvoiceleaved,
		onchannelmessage,
		onchannelpresence,
		ondisconnect,
		onmessagetyping,
		onmessagereaction,
		onnotification,
		onstatuspresence,
		socketRef,
	]);

	useEffect(() => {
		initWorker();
		return () => {
			unInitWorker();
		};
	}, [initWorker, unInitWorker]);

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

const ChatContextConsumer = ChatContext.Consumer;

export { ChatContext, ChatContextConsumer, ChatContextProvider };
