import {
	channelMembersActions,
	channelsActions,
	clansActions,
	directActions,
	friendsActions,
	mapMessageChannelToEntity,
	mapNotificationToEntity,
	mapReactionToEntity,
	messagesActions,
	notificationActions,
	pinMessageActions,
	reactionActions,
	selectCurrentChannel,
	selectCurrentClanId,
	toastActions,
	useAppDispatch,
	voiceActions,
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { NotificationCode } from '@mezon/utils';
import {
	ChannelCreatedEvent,
	ChannelDeletedEvent,
	ChannelMessageEvent,
	ChannelPresenceEvent,
	ChannelUpdatedEvent,
	CustomStatusEvent,
	LastPinMessageEvent,
	MessageReactionEvent,
	MessageTypingEvent,
	Notification,
	Socket,
	StatusPresenceEvent,
	VoiceJoinedEvent,
	VoiceLeavedEvent,
} from 'mezon-js';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppParams } from '../../app/hooks/useAppParams';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSeenMessagePool } from '../hooks/useSeenMessagePool';

type ChatContextProviderProps = {
	children: React.ReactNode;
};

export type ChatContextValue = {
	setCallbackEventFn: (socket: Socket) => void;
};

const ChatContext = React.createContext<ChatContextValue>({} as ChatContextValue);

const ChatContextProvider: React.FC<ChatContextProviderProps> = ({ children }) => {
	const { socketRef, reconnect } = useMezon();
	const { userId } = useAuth();
	const currentChannel = useSelector(selectCurrentChannel);
	const { directId, channelId, clanId } = useAppParams();
	const { initWorker, unInitWorker } = useSeenMessagePool();
	const dispatch = useAppDispatch();
	const currentClanId = useSelector(selectCurrentClanId);

	const clanIdActive = useMemo(() => {
		if (clanId !== undefined) {
			return currentClanId;
		} else {
			return '0';
		}
	}, [clanId]);

	const onvoicejoined = useCallback(
		(voice: VoiceJoinedEvent) => {
			if (voice) {
				dispatch(
					voiceActions.add({
						...voice,
					}),
				);
			}
		},
		[dispatch],
	);

	const onvoiceleaved = useCallback(
		(voice: VoiceLeavedEvent) => {
			dispatch(voiceActions.remove(voice.id));
		},
		[dispatch],
	);

	const onchannelmessage = useCallback(
		async (message: ChannelMessageEvent) => {
			const senderId = message.sender_id;
			const timestamp = Date.now() / 1000;
			const mess = mapMessageChannelToEntity(message);

			mess.isMe = senderId === userId;
			mess.isCurrentChannel = message.channel_id === directId;
			if (directId === undefined) {
				mess.isCurrentChannel = message.channel_id === channelId;
			}
			dispatch(directActions.updateDMSocket(message));
			dispatch(channelsActions.setChannelLastSentTimestamp({ channelId: message.channel_id, timestamp }));
			dispatch(directActions.setDirectLastSentTimestamp({ channelId: message.channel_id, timestamp }));
			dispatch(directActions.setCountMessUnread({ channelId: message.channel_id }));
			dispatch(messagesActions.newMessage(mess));
			dispatch(notificationActions.setIsMessageRead(true));
			dispatch(channelsActions.updateChannelThreadSocket({ ...message, timestamp }));
		},
		[dispatch, userId, channelId, directId],
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
		async (notification: Notification) => {
			if (currentChannel?.channel_id !== (notification as any).channel_id) {
				dispatch(notificationActions.add(mapNotificationToEntity(notification)));
				dispatch(notificationActions.setNotiListUnread(mapNotificationToEntity(notification)));
				dispatch(notificationActions.setStatusNoti());
			}

			if (currentChannel?.channel_id === (notification as any).channel_id) {
				const timestamp = Date.now() / 1000;
				dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId: (notification as any).channel_id, timestamp: timestamp }));
			}

			if (notification.code === NotificationCode.FRIEND_REQUEST || notification.code === NotificationCode.FRIEND_ACCEPT) {
				dispatch(toastActions.addToast({ message: notification.subject, type: 'info', id: 'ACTION_FRIEND' }));
				dispatch(friendsActions.fetchListFriends({ noCache: true }));
			}
		},
		[currentChannel?.channel_id, dispatch],
	);

	const onpinmessage = useCallback(
		(pin: LastPinMessageEvent) => {
			if (pin.operation === 1) {
				dispatch(pinMessageActions.fetchChannelPinMessages({ channelId: currentChannel?.channel_id ?? '', noCache: true }));
			}
			if (pin.operation === 0) {
				dispatch(channelsActions.fetchChannels({ clanId: currentChannel?.clan_id ?? '', noCache: true }));
			}
		},
		[currentChannel?.channel_id, currentChannel?.clan_id, dispatch],
	);

	const oncustomstatus = useCallback(
		(statusEvent: CustomStatusEvent) => {
			dispatch(channelMembersActions.setCustomStatusUser({ userId: statusEvent.user_id, customStatus: statusEvent.status }));
		},
		[dispatch],
	);

	const onerror = useCallback(
		(event: unknown) => {
			dispatch(toastActions.addToast({ message: 'Socket connection failed', type: 'error', id: 'SOCKET_CONNECTION_ERROR' }));
		},
		[dispatch],
	);

	const onmessagetyping = useCallback(
		(e: MessageTypingEvent) => {
			if (e && e.sender_id === userId) {
				return;
			}

			dispatch(
				messagesActions.updateTypingUsers({
					channelId: e.channel_id,
					userId: e.sender_id,
					isTyping: true,
				}),
			);
		},
		[dispatch, userId],
	);

	const onmessagereaction = useCallback(
		(e: MessageReactionEvent) => {
			if (e.count > 0) {
				dispatch(reactionActions.setReactionDataSocket(mapReactionToEntity(e)));
			}
		},
		[dispatch],
	);

	const onchannelcreated = useCallback(
		(channelCreated: ChannelCreatedEvent) => {
			if (channelCreated) {
				dispatch(channelsActions.createChannelSocket(channelCreated));
				dispatch(clansActions.joinClan({ clanId: channelCreated.clan_id as string }));
			}
		},
		[dispatch],
	);

	const onchanneldeleted = useCallback(
		(channelDeleted: ChannelDeletedEvent) => {
			if (channelDeleted) {
				dispatch(channelsActions.deleteChannelSocket(channelDeleted));
			}
		},
		[dispatch],
	);

	const onchannelupdated = useCallback(
		(channelUpdated: ChannelUpdatedEvent) => {
			if (channelUpdated) {
				if (channelUpdated.channel_label === '') {
					dispatch(channelsActions.updateChannelPrivateSocket(channelUpdated));
					dispatch(channelsActions.fetchChannels({ clanId: channelUpdated.clan_id, noCache: true }));
				} else {
					dispatch(channelsActions.updateChannelSocket(channelUpdated));
				}
			}
		},
		[dispatch],
	);

	const setCallbackEventFn = React.useCallback(
		(socket: Socket) => {
			socket.onvoicejoined = onvoicejoined;

			socket.onvoiceleaved = onvoiceleaved;

			socket.onchannelmessage = onchannelmessage;

			socket.onchannelpresence = onchannelpresence;

			socket.ondisconnect = ondisconnect;

			socket.onerror = onerror;

			socket.onmessagetyping = onmessagetyping;

			socket.onmessagereaction = onmessagereaction;

			socket.onnotification = onnotification;

			socket.onpinmessage = onpinmessage;

			socket.oncustomstatus = oncustomstatus;

			socket.onstatuspresence = onstatuspresence;

			socket.onchannelcreated = onchannelcreated;

			socket.onchanneldeleted = onchanneldeleted;

			socket.onchannelupdated = onchannelupdated;

			socket.onheartbeattimeout = onHeartbeatTimeout;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			onchannelcreated,
			onchanneldeleted,
			onchannelmessage,
			onchannelpresence,
			onchannelupdated,
			onerror,
			onmessagereaction,
			onmessagetyping,
			onnotification,
			onpinmessage,
			oncustomstatus,
			onstatuspresence,
			onvoicejoined,
			onvoiceleaved,
		],
	);

	const ondisconnect = useCallback(() => {
		dispatch(toastActions.addToast({ message: 'Socket disconnected', type: 'error', id: 'SOCKET_CONNECTION_ERROR' }));
		reconnect(clanIdActive ?? '').then((socket) => {
			if (!socket) return;
			setCallbackEventFn(socket as Socket);
		});
	}, [dispatch, reconnect, clanIdActive, setCallbackEventFn]);

	const onHeartbeatTimeout = useCallback(() => {
		dispatch(toastActions.addToast({ message: 'Socket hearbeat timeout', type: 'error', id: 'SOCKET_CONNECTION_ERROR' }));
		reconnect(clanIdActive ?? '').then((socket) => {
			if (!socket) return;
			setCallbackEventFn(socket as Socket);
		});
	}, [clanIdActive, dispatch, reconnect, setCallbackEventFn]);

	useEffect(() => {
		const socket = socketRef.current;
		if (!socket) return;
		setCallbackEventFn(socket);

		return () => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onchannelmessage = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onchannelpresence = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onnotification = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onnotification = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onpinmessage = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.oncustomstatus = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onstatuspresence = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.ondisconnect = () => {};
		};
	}, [
		onchannelmessage,
		onchannelpresence,
		ondisconnect,
		onmessagetyping,
		onmessagereaction,
		onnotification,
		onpinmessage,
		oncustomstatus,
		onstatuspresence,
		socketRef,
		onvoicejoined,
		onvoiceleaved,
		onerror,
		onchannelcreated,
		onchanneldeleted,
		onchannelupdated,
		onHeartbeatTimeout,
		setCallbackEventFn,
	]);

	useEffect(() => {
		initWorker();
		return () => {
			unInitWorker();
		};
	}, [initWorker, unInitWorker]);

	const value = React.useMemo<ChatContextValue>(
		() => ({
			// add logic code
			setCallbackEventFn,
		}),
		[setCallbackEventFn],
	);

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

const ChatContextConsumer = ChatContext.Consumer;

export { ChatContext, ChatContextConsumer, ChatContextProvider };
