import { useAppParams } from '@mezon/core';
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
	toastActions,
	useAppDispatch,
	voiceActions,
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import {
	ChannelCreatedEvent,
	ChannelDeletedEvent,
	ChannelMessageEvent,
	ChannelPresenceEvent,
	ChannelUpdatedEvent,
	LastPinMessageEvent,
	MessageReactionEvent,
	MessageTypingEvent,
	Notification,
	StatusPresenceEvent,
	VoiceJoinedEvent,
	VoiceLeavedEvent,
} from 'mezon-js';
import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSeenMessagePool } from '../hooks/useSeenMessagePool';

type ChatContextProviderProps = {
	children: React.ReactNode;
};

export type ChatContextValue = object;

const ChatContext = React.createContext<ChatContextValue>({} as ChatContextValue);

const ChatContextProvider: React.FC<ChatContextProviderProps> = ({ children }) => {
	const value = React.useMemo<ChatContextValue>(
		() => ({
			// add logic code
		}),
		[],
	);

	const { socketRef, reconnect } = useMezon();
	const { userId } = useAuth();
	const currentChannel = useSelector(selectCurrentChannel);
	const { directId, channelId } = useAppParams();
	const { initWorker, unInitWorker } = useSeenMessagePool();
	const dispatch = useAppDispatch();

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
		(notification: Notification) => {
			if (currentChannel?.channel_id !== (notification as any).channel_id) {
				dispatch(notificationActions.add(mapNotificationToEntity(notification)));
			}
			if (notification.code === -2 || notification.code === -3) {
				toast.info(notification.subject);
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
		[currentChannel?.channel_id, dispatch],
	);

	const ondisconnect = useCallback(() => {
		dispatch(toastActions.addToast({ message: 'Socket connection failed', type: 'error', id: 'SOCKET_CONNECTION_ERROR' }));
		reconnect();
	}, [reconnect, dispatch]);

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
					dispatch(channelsActions.fetchChannels({ clanId: channelUpdated.clan_id, channelType: 1, noCache: true }));
				} else {
					dispatch(channelsActions.updateChannelSocket(channelUpdated));
				}
			}
		},
		[dispatch],
	);

	const onHeartbeatTimeout = useCallback(() => {
		console.log('Heartbeat timeout');
		dispatch(toastActions.addToast({ message: 'Socket connection failed', type: 'error', id: 'SOCKET_CONNECTION_ERROR' }));
		reconnect();
	}, [dispatch, reconnect]);

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

		socket.onpinmessage = onpinmessage;

		socket.onstatuspresence = onstatuspresence;

		socket.onchannelcreated = onchannelcreated;

		socket.onchanneldeleted = onchanneldeleted;

		socket.onchannelupdated = onchannelupdated;

		socket.onheartbeattimeout = onHeartbeatTimeout;

		return () => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onchannelmessage = () => { };
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onchannelpresence = () => { };
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onnotification = () => { };
			socket.onpinmessage = () => { };
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onstatuspresence = () => { };
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.ondisconnect = () => { };
		};
	}, [
		onchannelmessage,
		onchannelpresence,
		ondisconnect,
		onmessagetyping,
		onmessagereaction,
		onnotification,
		onpinmessage,
		onstatuspresence,
		socketRef,
		onvoicejoined,
		onvoiceleaved,
		onerror,
		onchannelcreated,
		onchanneldeleted,
		onchannelupdated,
		onHeartbeatTimeout,
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
