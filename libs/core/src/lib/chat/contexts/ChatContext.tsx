/* eslint-disable react-hooks/exhaustive-deps */
import {
	appActions,
	channelMembers,
	channelMembersActions,
	channelMetaActions,
	channelsActions,
	channelsSlice,
	channelsStreamActions,
	clansSlice,
	directActions,
	directMetaActions,
	directSlice,
	eventManagementActions,
	fetchChannelMembers,
	fetchDirectMessage,
	fetchListFriends,
	fetchMessages,
	friendsActions,
	giveCoffeeActions,
	listChannelsByUserActions,
	mapMessageChannelToEntity,
	mapNotificationToEntity,
	mapReactionToEntity,
	messagesActions,
	notificationActions,
	pinMessageActions,
	policiesActions,
	reactionActions,
	rolesClanActions,
	selectChannelById,
	selectChannelsByClanId,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectCurrentClanId,
	selectDirectById,
	selectDmGroupCurrentId,
	selectMessageByMessageId,
	selectModeResponsive,
	stickerSettingActions,
	toastActions,
	useAppDispatch,
	useAppSelector,
	usersClanActions,
	usersStreamActions,
	voiceActions
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { EMOJI_GIVE_COFFEE, ModeResponsive, NotificationCode } from '@mezon/utils';
import {
	AddClanUserEvent,
	ChannelCreatedEvent,
	ChannelDeletedEvent,
	ChannelMessage,
	ChannelPresenceEvent,
	ChannelStreamMode,
	ChannelType,
	ChannelUpdatedEvent,
	ClanDeletedEvent,
	ClanProfileUpdatedEvent,
	CustomStatusEvent,
	LastPinMessageEvent,
	MessageTypingEvent,
	Notification,
	RoleEvent,
	Socket,
	StatusPresenceEvent,
	StickerCreateEvent,
	StickerDeleteEvent,
	StickerUpdateEvent,
	StreamPresenceEvent,
	StreamingEndedEvent,
	StreamingJoinedEvent,
	StreamingLeavedEvent,
	StreamingStartedEvent,
	UserChannelAddedEvent,
	UserChannelRemovedEvent,
	UserClanRemovedEvent,
	VoiceJoinedEvent,
	VoiceLeavedEvent
} from 'mezon-js';
import { ApiCreateEventRequest, ApiGiveCoffeeEvent, ApiMessageReaction } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAppParams } from '../../app/hooks/useAppParams';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSeenMessagePool } from '../hooks/useSeenMessagePool';

type ChatContextProviderProps = {
	children: React.ReactNode;
};

export type ChatContextValue = {
	setCallbackEventFn: (socket: Socket) => void;
	handleReconnect: (socketType: string) => void;
};

const ChatContext = React.createContext<ChatContextValue>({} as ChatContextValue);

const ChatContextProvider: React.FC<ChatContextProviderProps> = ({ children }) => {
	const { socketRef, reconnectWithTimeout } = useMezon();
	const { userId } = useAuth();
	const currentChannel = useSelector(selectCurrentChannel);
	const { directId, channelId, clanId } = useAppParams();
	const { initWorker, unInitWorker } = useSeenMessagePool();
	const dispatch = useAppDispatch();
	const currentClanId = useSelector(selectCurrentClanId);
	const currentDirectId = useSelector(selectDmGroupCurrentId);
	const currentChannelId = useSelector(selectCurrentChannelId);
	const modeResponsive = useSelector(selectModeResponsive);
	const channels = useAppSelector(selectChannelsByClanId(clanId as string));
	const navigate = useNavigate();

	const clanIdActive = useMemo(() => {
		if (clanId !== undefined || currentClanId) {
			return currentClanId;
		} else {
			return '0';
		}
	}, [clanId, currentClanId]);

	const onvoicejoined = useCallback(
		(voice: VoiceJoinedEvent) => {
			if (voice) {
				dispatch(
					voiceActions.add({
						...voice
					})
				);
			}
		},
		[dispatch]
	);

	const onvoiceleaved = useCallback(
		(voice: VoiceLeavedEvent) => {
			dispatch(voiceActions.remove(voice.id));
		},
		[dispatch]
	);

	const onstreamingchanneljoined = useCallback(
		(user: StreamingJoinedEvent) => {
			if (user) {
				dispatch(
					usersStreamActions.add({
						...user
					})
				);
			}
		},
		[dispatch]
	);

	const onstreamingchannelleaved = useCallback(
		(user: StreamingLeavedEvent) => {
			dispatch(usersStreamActions.remove(user.id));
		},
		[dispatch]
	);

	const onstreamingchannelstarted = useCallback(
		(channel: StreamingStartedEvent) => {
			if (channel) {
				dispatch(
					channelsStreamActions.add({
						id: channel.channel_id,
						channel_id: channel.channel_id,
						clan_id: channel.clan_id,
						is_streaming: channel.is_streaming,
						streaming_url: channel.streaming_url !== '' ? `${channel.streaming_url}&user_id=${userId}` : channel.streaming_url
					})
				);
			}
		},
		[dispatch]
	);

	const onstreamingchannelended = useCallback(
		(channel: StreamingEndedEvent) => {
			dispatch(usersStreamActions.remove(channel.channel_id));
		},
		[dispatch]
	);

	const onchannelmessage = useCallback(
		async (message: ChannelMessage) => {
			const senderId = message.sender_id;
			const timestamp = Date.now() / 1000;
			const mess = mapMessageChannelToEntity(message);
			mess.isMe = senderId === userId;
			const isMobile = directId === undefined && channelId === undefined;

			mess.isCurrentChannel = message.channel_id === directId || (isMobile && message.channel_id === currentDirectId);

			if ((directId === undefined && !isMobile) || (isMobile && !currentDirectId)) {
				const idToCompare = !isMobile ? channelId : currentChannelId;
				mess.isCurrentChannel = message.channel_id === idToCompare;
			}
			dispatch(messagesActions.addNewMessage(mess));
			if (mess.mode === ChannelStreamMode.STREAM_MODE_DM || mess.mode === ChannelStreamMode.STREAM_MODE_GROUP) {
				dispatch(directMetaActions.updateDMSocket(message));

				const isClanView = currentClanId && currentClanId !== '0';
				const isNotCurrentDirect = isClanView || !currentDirectId || (currentDirectId && !RegExp(currentDirectId).test(message?.channel_id));
				if (isNotCurrentDirect) {
					dispatch(directActions.openDirectMessage({ channelId: message.channel_id, clanId: message.clan_id || '' }));
					dispatch(directMetaActions.setDirectLastSentTimestamp({ channelId: message.channel_id, timestamp }));
					dispatch(directMetaActions.setCountMessUnread({ channelId: message.channel_id }));
				}
				if (mess.isMe) {
					dispatch(directMetaActions.setDirectLastSeenTimestamp({ channelId: message.channel_id, timestamp }));
				}
			} else {
				dispatch(channelMetaActions.setChannelLastSentTimestamp({ channelId: message.channel_id, timestamp }));
			}
			dispatch(listChannelsByUserActions.updateLastSentTime({ channelId: message.channel_id }));
			dispatch(notificationActions.setIsMessageRead(true));
			// remove: setChannelLastSentTimestamp for fix re-render currentChannel when receive new message
			// dispatch(channelsActions.updateChannelThreadSocket({ ...message, timestamp }));
		},
		[userId, directId, currentDirectId, dispatch, channelId, currentChannelId, currentClanId]
	);

	const onchannelpresence = useCallback(
		(channelPresence: ChannelPresenceEvent) => {
			dispatch(channelMembersActions.fetchChannelMembersPresence(channelPresence));
		},
		[dispatch]
	);

	const onstreampresence = useCallback(
		(channelStreamPresence: StreamPresenceEvent) => {
			if (channelStreamPresence.joins.length > 0) {
				const onlineStatus = channelStreamPresence.joins.map((join) => {
					return { userId: join.user_id, status: true };
				});
				dispatch(usersClanActions.setManyStatusUser(onlineStatus));
			}
			if (channelStreamPresence.leaves.length > 0) {
				const offlineStatus = channelStreamPresence.leaves.map((leave) => {
					return { userId: leave.user_id, status: false };
				});
				dispatch(usersClanActions.setManyStatusUser(offlineStatus));
			}
		},
		[dispatch]
	);

	const onstatuspresence = useCallback(
		(statusPresence: StatusPresenceEvent) => {
			dispatch(channelMembersActions.updateStatusUser(statusPresence));
		},
		[dispatch]
	);

	const onnotification = useCallback(
		async (notification: Notification) => {
			if (currentChannel?.channel_id !== (notification as any).channel_id && (notification as any).clan_id !== '0') {
				dispatch(notificationActions.add(mapNotificationToEntity(notification)));
				dispatch(notificationActions.setNotiListUnread(mapNotificationToEntity(notification)));
				dispatch(notificationActions.setStatusNoti());
			}
			if (currentChannel?.channel_id === (notification as any).channel_id) {
				const timestamp = Date.now() / 1000;
				dispatch(channelMetaActions.setChannelLastSeenTimestamp({ channelId: (notification as any).channel_id, timestamp: timestamp }));
			}

			if (notification.code === NotificationCode.FRIEND_REQUEST || notification.code === NotificationCode.FRIEND_ACCEPT) {
				dispatch(toastActions.addToast({ message: notification.subject, type: 'info', id: 'ACTION_FRIEND' }));
				dispatch(friendsActions.fetchListFriends({ noCache: true }));
			}
		},
		[currentChannel?.channel_id, dispatch]
	);

	const onpinmessage = useCallback(
		(pin: LastPinMessageEvent) => {
			if (pin.operation === 1) {
				dispatch(pinMessageActions.fetchChannelPinMessages({ channelId: currentChannel?.channel_id ?? '', noCache: true }));
			}
			if (pin.operation === 0) {
				dispatch(channelMetaActions.setChannelLastSeenPinMessage({ channelId: pin.channel_id, lastSeenPinMess: pin.message_id }));
			}
		},
		[currentChannel?.channel_id, dispatch]
	);

	const onuserchannelremoved = useCallback(
		(user: UserChannelRemovedEvent) => {
			user?.user_ids.forEach((userID: any) => {
				if (userID === userId) {
					if (channelId === user.channel_id) {
						navigate(`/chat/clans/${clanId}`);
					}
					if (directId === user.channel_id) {
						navigate(`/chat/direct/friends`);
					}
					dispatch(directSlice.actions.removeByDirectID(user.channel_id));
					dispatch(channelsSlice.actions.removeByChannelID(user.channel_id));
					dispatch(listChannelsByUserActions.fetchListChannelsByUser());
				} else {
					dispatch(channelMembers.actions.remove({ userId: userID, channelId: user.channel_id }));
					if (user.channel_type === ChannelType.CHANNEL_TYPE_GROUP) {
						dispatch(fetchDirectMessage({ noCache: true }));
						dispatch(
							fetchChannelMembers({
								clanId: '',
								channelId: directId || '',
								noCache: true,
								channelType: ChannelType.CHANNEL_TYPE_GROUP
							})
						);
					}
				}
			});
		},
		[channelId, clanId, dispatch, navigate, userId, directId]
	);
	const onuserclanremoved = useCallback(
		(user: UserClanRemovedEvent) => {
			user?.user_ids.forEach((id: any) => {
				if (id === userId) {
					if (clanId === user.clan_id) {
						navigate(`/chat/direct/friends`);
					}
					dispatch(clansSlice.actions.removeByClanID(user.clan_id));
					dispatch(listChannelsByUserActions.fetchListChannelsByUser());
				} else {
					dispatch(
						channelMembers.actions.removeUserByUserIdAndClan({
							userId: id,
							channelIds: channels.map((item) => item.id),
							clanId: user.clan_id
						})
					);
					dispatch(usersClanActions.remove(id));
					dispatch(rolesClanActions.updateRemoveUserRole(id));
				}
			});
		},
		[userId, clanId, navigate, dispatch]
	);

	const onuserchanneladded = useCallback(
		(userAdds: UserChannelAddedEvent) => {
			const user = userAdds.users.find((user: any) => user.user_id === userId);
			if (user) {
				if (userAdds.channel_type === ChannelType.CHANNEL_TYPE_DM || userAdds.channel_type === ChannelType.CHANNEL_TYPE_GROUP) {
					dispatch(fetchDirectMessage({ noCache: true }));
					dispatch(fetchMessages({ channelId: userAdds?.channel_id, noCache: false, isFetchingLatestMessages: false }));
				}
				if (userAdds.channel_type === ChannelType.CHANNEL_TYPE_TEXT) {
					dispatch(channelsActions.fetchChannels({ clanId: userAdds.clan_id, noCache: true }));
					dispatch(listChannelsByUserActions.fetchListChannelsByUser());
				}
				if (userAdds.channel_type !== ChannelType.CHANNEL_TYPE_VOICE) {
					dispatch(
						channelsActions.joinChat({
							clanId: userAdds.clan_id,
							parentId: userAdds.parent_id,
							channelId: userAdds.channel_id,
							channelType: userAdds.channel_type,
							isPublic: userAdds.is_public,
							isParentPublic: userAdds.is_parent_public
						})
					);
				}
			} else {
				if (clanIdActive === userAdds.clan_id) {
					const members = userAdds?.users
						.filter((user) => user?.user_id)
						.map((user) => ({
							id: user.user_id,
							user: {
								...user,
								avatar_url: user.avatar,
								id: user.user_id,
								about_me: user.about_me,
								display_name: user.display_name,
								metadata: user.custom_status,
								username: user.username,
								create_time: new Date(user.create_time_second * 1000).toISOString()
							}
						}));
					dispatch(usersClanActions.upsertMany(members));
				}

				dispatch(
					channelMembersActions.fetchChannelMembers({
						clanId: userAdds.clan_id || '',
						channelId: userAdds.channel_id,
						noCache: true,
						channelType: userAdds.channel_type
					})
				);
				if (userAdds.channel_type === ChannelType.CHANNEL_TYPE_GROUP || userAdds.channel_type === ChannelType.CHANNEL_TYPE_GROUP) {
					dispatch(fetchDirectMessage({ noCache: true }));
					dispatch(fetchListFriends({ noCache: true }));
				}
			}
		},
		[userId, dispatch]
	);

	const onuserclanadded = useCallback(
		(userJoinClan: AddClanUserEvent) => {
			if (modeResponsive === ModeResponsive.MODE_DM || currentChannel?.channel_private) {
				return;
			}
			if (userJoinClan?.user && clanIdActive === userJoinClan.clan_id) {
				const createTime = new Date(userJoinClan.user.create_time_second * 1000).toISOString();
				dispatch(
					usersClanActions.add({
						...userJoinClan,
						id: userJoinClan.user.user_id,
						user: {
							...userJoinClan.user,
							avatar_url: userJoinClan.user.avatar,
							id: userJoinClan.user.user_id,
							about_me: userJoinClan.user.about_me,
							display_name: userJoinClan.user.display_name,
							metadata: userJoinClan.user.custom_status,
							username: userJoinClan.user.username,
							create_time: createTime
						}
					})
				);
			}
		},
		[clanIdActive, currentChannel?.channel_private, dispatch]
	);

	const onstickercreated = useCallback(
		(stickerCreated: StickerCreateEvent) => {
			if (userId !== stickerCreated.creator_id) {
				dispatch(
					stickerSettingActions.add({
						category: stickerCreated.category,
						clan_id: stickerCreated.clan_id,
						creator_id: stickerCreated.creator_id,
						id: stickerCreated.sticker_id,
						shortname: stickerCreated.shortname,
						source: stickerCreated.source,
						logo: stickerCreated.logo,
						clan_name: stickerCreated.clan_name
					})
				);
			}
		},
		[dispatch, userId]
	);

	const onstickerdeleted = useCallback(
		(stickerDeleted: StickerDeleteEvent) => {
			if (userId !== stickerDeleted.user_id) {
				dispatch(stickerSettingActions.remove(stickerDeleted.sticker_id));
			}
		},
		[userId, dispatch]
	);

	const onstickerupdated = useCallback(
		(stickerUpdated: StickerUpdateEvent) => {
			if (userId !== stickerUpdated.user_id) {
				dispatch(
					stickerSettingActions.update({
						id: stickerUpdated.sticker_id,
						changes: {
							shortname: stickerUpdated.shortname
						}
					})
				);
			}
		},
		[userId, dispatch]
	);

	const onclanprofileupdated = useCallback(
		(ClanProfileUpdates: ClanProfileUpdatedEvent) => {
			dispatch(
				usersClanActions.updateUserChannel({
					userId: ClanProfileUpdates.user_id,
					clanId: ClanProfileUpdates.clan_id,
					clanNick: ClanProfileUpdates.clan_nick,
					clanAvt: ClanProfileUpdates.clan_avatar
				})
			);
			dispatch(
				messagesActions.updateUserMessage({
					userId: ClanProfileUpdates.user_id,
					clanId: ClanProfileUpdates.clan_id,
					clanNick: ClanProfileUpdates.clan_nick,
					clanAvt: ClanProfileUpdates.clan_avatar
				})
			);
			dispatch(
				usersClanActions.updateUserClan({
					userId: ClanProfileUpdates.user_id,
					clanNick: ClanProfileUpdates.clan_nick,
					clanAvt: ClanProfileUpdates.clan_avatar
				})
			);
		},
		[dispatch]
	);

	const oncustomstatus = useCallback(
		(statusEvent: CustomStatusEvent) => {
			dispatch(channelMembersActions.setCustomStatusUser({ userId: statusEvent.user_id, customStatus: statusEvent.status }));
		},
		[dispatch]
	);

	const onerror = useCallback(
		(event: unknown) => {
			dispatch(toastActions.addToast({ message: 'Socket connection failed', type: 'error', id: 'SOCKET_CONNECTION_ERROR' }));
		},
		[dispatch]
	);

	const onmessagetyping = useCallback(
		(e: MessageTypingEvent) => {
			dispatch(
				messagesActions.updateTypingUsers({
					channelId: e.channel_id,
					userId: e.sender_id,
					isTyping: true
				})
			);
		},
		[dispatch, userId]
	);

	const onmessagereaction = useCallback(
		(e: ApiMessageReaction) => {
			if (e.count > 0) {
				dispatch(reactionActions.setReactionDataSocket(mapReactionToEntity(e)));
			}
		},
		[dispatch]
	);

	const onchannelcreated = useCallback(
		(channelCreated: ChannelCreatedEvent) => {
			if (channelCreated && channelCreated.channel_private === 0) {
				dispatch(channelsActions.createChannelSocket(channelCreated));
				dispatch(listChannelsByUserActions.fetchListChannelsByUser());
				if (channelCreated.channel_type !== ChannelType.CHANNEL_TYPE_VOICE) {
					dispatch(
						channelsActions.joinChat({
							clanId: channelCreated.clan_id,
							parentId: channelCreated.parent_id,
							channelId: channelCreated.channel_id,
							channelType: channelCreated.channel_type,
							isPublic: !channelCreated.channel_private,
							isParentPublic: channelCreated.is_parent_public
						})
					);
				}
			}
		},
		[dispatch]
	);

	const onclandeleted = useCallback(
		(clanDelete: ClanDeletedEvent) => {
			dispatch(listChannelsByUserActions.fetchListChannelsByUser());
			dispatch(stickerSettingActions.removeStickersByClanId(clanDelete.clan_id));
			if (clanDelete.deletor !== userId && currentClanId === clanDelete.clan_id) {
				navigate(`/chat/direct/friends`);
				dispatch(clansSlice.actions.removeByClanID(clanDelete.clan_id));
				dispatch(listChannelsByUserActions.fetchListChannelsByUser());
			}
		},
		[currentClanId, dispatch, navigate, userId]
	);

	const onchanneldeleted = useCallback(
		(channelDeleted: ChannelDeletedEvent) => {
			if (channelDeleted) {
				dispatch(channelsActions.deleteChannelSocket(channelDeleted));
				dispatch(listChannelsByUserActions.fetchListChannelsByUser());
			}
		},
		[dispatch]
	);

	const onchannelupdated = useCallback(
		(channelUpdated: ChannelUpdatedEvent) => {
			if (channelUpdated.is_error) {
				return dispatch(channelsActions.deleteChannel({ channelId: channelUpdated.channel_id, clanId: channelUpdated.clan_id as string }));
			}
			if (channelUpdated) {
				if (channelUpdated.channel_label === '') {
					dispatch(channelsActions.updateChannelPrivateSocket(channelUpdated));
					if (channelUpdated.creator_id !== userId) {
						dispatch(channelsActions.fetchChannels({ clanId: channelUpdated.clan_id, noCache: true }));
						dispatch(listChannelsByUserActions.fetchListChannelsByUser());
					}
				} else {
					dispatch(channelsActions.updateChannelSocket(channelUpdated));
				}
			}
		},
		[dispatch, userId]
	);

	const oneventcreated = useCallback(
		(eventCreatedEvent: ApiCreateEventRequest) => {
			dispatch(eventManagementActions.updateStatusEvent(eventCreatedEvent));
		},
		[dispatch]
	);

	const [triggerDate, setTriggerDate] = useState<number>(Date.now());

	const [messageIdCoffee, setMessageIdCoffee] = useState('');
	const [channelIdCoffee, setChannelIdCoffee] = useState('');
	const messageCoffee = useSelector(selectMessageByMessageId(messageIdCoffee ?? ''));
	const channelCoffee = useAppSelector(selectChannelById(channelIdCoffee));
	const directCoffee = useAppSelector((state) => selectDirectById(state, channelIdCoffee));
	const parentChannelCoffee = useAppSelector(selectChannelById(channelCoffee?.parrent_id ?? ''));

	useEffect(() => {
		const currentActive = channelCoffee ? channelCoffee : directCoffee;
		if (messageCoffee !== undefined && !currentActive !== undefined && parentChannelCoffee !== undefined) {
			const mode =
				currentActive.type === ChannelType.CHANNEL_TYPE_TEXT
					? ChannelStreamMode.STREAM_MODE_CHANNEL
					: currentActive.type === ChannelType.CHANNEL_TYPE_GROUP
						? ChannelStreamMode.STREAM_MODE_GROUP
						: currentActive.type === ChannelType.CHANNEL_TYPE_DM
							? ChannelStreamMode.STREAM_MODE_DM
							: 0;
			const parentId = currentActive?.parrent_id;
			const isPublic = !currentActive?.channel_private;
			const isParentPublic = !currentActive?.channel_private;

			dispatch(
				reactionActions.writeMessageReaction({
					id: '',
					clanId: currentActive?.clan_id ?? '0',
					parentId: parentId ?? '0',
					channelId: messageCoffee.channel_id ?? '',
					mode: mode ?? 0,
					messageId: messageIdCoffee ?? '',
					emoji_id: EMOJI_GIVE_COFFEE.emoji_id,
					emoji: EMOJI_GIVE_COFFEE.emoji,
					count: 1,
					messageSenderId: messageCoffee?.sender_id ?? '',
					actionDelete: false,
					isPublic: mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? isPublic : false,
					isParentPulic: parentId === '0' || mode !== ChannelStreamMode.STREAM_MODE_CHANNEL ? false : isParentPublic
				})
			);
		}
	}, [triggerDate, dispatch]);

	const oncoffeegiven = useCallback((coffeeEvent: ApiGiveCoffeeEvent) => {
		dispatch(giveCoffeeActions.setTokenFromSocket({ userId, coffeeEvent }));

		if (coffeeEvent?.message_ref_id) {
			setMessageIdCoffee(coffeeEvent.message_ref_id ?? '');
			setChannelIdCoffee(coffeeEvent.channel_id ?? '');
		}
		if (userId === coffeeEvent.sender_id) {
			setTriggerDate(Date.now());
		}
	}, []);

	const onroleevent = useCallback((roleEvent: RoleEvent) => {
		const handleRoleEvent = async () => {
			if (roleEvent.status === 0) {
				if (userId !== roleEvent.user_id) {
					dispatch(
						rolesClanActions.add({
							id: roleEvent.role.id || '',
							clan_id: roleEvent.role.clan_id,
							creator_id: roleEvent.role.creator_id,
							title: roleEvent.role.title,
							permission_list: roleEvent.role.permission_list,
							role_user_list: roleEvent.role.role_user_list,
							active: roleEvent.role.active
						})
					);
					if (roleEvent?.role?.role_user_list?.role_users) {
						const userExists = roleEvent.role.role_user_list.role_users.some((user) => user.id === userId);
						if (userExists) {
							dispatch(policiesActions.fetchPermissionsUser({ clanId: roleEvent.role.clan_id || '' }));
						}
						dispatch(usersClanActions.fetchUsersClan({ clanId: roleEvent.role.clan_id || '' }));
					}
				}
			} else if (roleEvent.status === 1) {
				if (userId !== roleEvent.user_id) {
					if (roleEvent?.role?.role_user_list?.role_users) {
						dispatch(usersClanActions.fetchUsersClan({ clanId: roleEvent.role.clan_id || '' }));
					}
					if (roleEvent.role.permission_list?.permissions || roleEvent.role.role_user_list?.role_users) {
						const isUserResult = await dispatch(
							rolesClanActions.updatePermissionUserByRoleId({ roleId: roleEvent.role.id || '', userId: userId || '' })
						).unwrap();
						if (isUserResult) {
							dispatch(policiesActions.fetchPermissionsUser({ clanId: roleEvent.role.clan_id || '' }));
						}
					}
					dispatch(rolesClanActions.update(roleEvent.role));
				}
			} else if (roleEvent.status === 2) {
				if (userId !== roleEvent.user_id) {
					const isUserResult = await dispatch(
						rolesClanActions.updatePermissionUserByRoleId({ roleId: roleEvent.role.id || '', userId: userId || '' })
					).unwrap();
					if (isUserResult) {
						dispatch(policiesActions.fetchPermissionsUser({ clanId: roleEvent.role.clan_id || '' }));
					}
					dispatch(rolesClanActions.remove(roleEvent.role.id || ''));
				}
			}
		};
		handleRoleEvent();
	}, []);
	const setCallbackEventFn = React.useCallback(
		(socket: Socket) => {
			socket.onvoicejoined = onvoicejoined;

			socket.onvoiceleaved = onvoiceleaved;

			socket.onstreamingchanneljoined = onstreamingchanneljoined;

			socket.onstreamingchannelleaved = onstreamingchannelleaved;

			socket.onstreamingchannelstarted = onstreamingchannelstarted;

			socket.onstreamingchannelended = onstreamingchannelended;

			socket.onchannelmessage = onchannelmessage;

			socket.onchannelpresence = onchannelpresence;

			socket.onstreampresence = onstreampresence;

			socket.ondisconnect = ondisconnect;

			socket.onerror = onerror;

			socket.onmessagetyping = onmessagetyping;

			socket.onmessagereaction = onmessagereaction;

			socket.onnotification = onnotification;

			socket.onpinmessage = onpinmessage;

			socket.onuserchannelremoved = onuserchannelremoved;

			socket.onuserclanremoved = onuserclanremoved;

			socket.onclandeleted = onclandeleted;

			socket.onuserchanneladded = onuserchanneladded;

			socket.onstickercreated = onstickercreated;

			socket.onstickerdeleted = onstickerdeleted;

			socket.onstickerupdated = onstickerupdated;

			socket.onuserclanadded = onuserclanadded;

			socket.onclanprofileupdated = onclanprofileupdated;

			socket.oncustomstatus = oncustomstatus;

			socket.onstatuspresence = onstatuspresence;

			socket.onchannelcreated = onchannelcreated;

			socket.onchanneldeleted = onchanneldeleted;

			socket.onchannelupdated = onchannelupdated;

			socket.oneventcreated = oneventcreated;

			socket.onheartbeattimeout = onHeartbeatTimeout;

			socket.oncoffeegiven = oncoffeegiven;

			socket.onroleevent = onroleevent;
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
			onuserchannelremoved,
			onuserclanremoved,
			onclandeleted,
			onuserchanneladded,
			onuserclanadded,
			onstickercreated,
			onstickerdeleted,
			onstickerupdated,
			onclanprofileupdated,
			oncustomstatus,
			onstatuspresence,
			onvoicejoined,
			onvoiceleaved,
			onstreamingchanneljoined,
			onstreamingchannelleaved,
			onstreamingchannelstarted,
			onstreamingchannelended,
			oneventcreated,
			oncoffeegiven,
			onroleevent
		]
	);

	const handleReconnect = useCallback(
		async (socketType: string) => {
			if (socketRef.current?.isOpen()) return;
			dispatch(toastActions.addToast({ message: socketType, type: 'info' }));
			const errorMessage = 'Cannot reconnect to the socket. Please restart the app.';
			try {
				const socket = await reconnectWithTimeout(clanIdActive ?? '');
				if (!socket) {
					dispatch(toastActions.addToast({ message: errorMessage, type: 'warning', autoClose: false }));
					return;
				}

				if (window && navigator) {
					if (navigator.onLine) {
						dispatch(appActions.refreshApp());
					} else {
						dispatch(toastActions.addToast({ message: errorMessage, type: 'warning', autoClose: false }));
					}
				}

				setCallbackEventFn(socket as Socket);
			} catch (error) {
				dispatch(toastActions.addToast({ message: errorMessage, type: 'warning', autoClose: false }));
			}
		},
		[dispatch, clanIdActive, reconnectWithTimeout, setCallbackEventFn]
	);

	const ondisconnect = useCallback(() => {
		handleReconnect('Socket disconnected, attempting to reconnect...');
	}, [handleReconnect]);

	const onHeartbeatTimeout = useCallback(() => {
		handleReconnect('Socket hearbeat timeout, attempting to reconnect...');
	}, [handleReconnect]);

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
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onuserchannelremoved = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onuserclanremoved = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onclandeleted = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onuserchanneladded = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onuserclanadded = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onstickercreated = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onstickerdeleted = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onstickerupdated = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onclanprofileupdated = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.oncoffeegiven = () => {};
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			socket.onroleevent = () => {};
		};
	}, [
		onchannelmessage,
		onchannelpresence,
		ondisconnect,
		onmessagetyping,
		onmessagereaction,
		onnotification,
		onpinmessage,
		onuserchannelremoved,
		onuserclanremoved,
		onclandeleted,
		onuserchanneladded,
		onuserclanadded,
		onstickerupdated,
		onstickerdeleted,
		onstickercreated,
		onclanprofileupdated,
		oncustomstatus,
		onstatuspresence,
		socketRef,
		onvoicejoined,
		onvoiceleaved,
		onstreamingchanneljoined,
		onstreamingchannelleaved,
		onstreamingchannelstarted,
		onstreamingchannelended,
		onerror,
		onchannelcreated,
		onchanneldeleted,
		onchannelupdated,
		onHeartbeatTimeout,
		oneventcreated,
		setCallbackEventFn,
		oncoffeegiven,
		onroleevent
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
			handleReconnect
		}),
		[setCallbackEventFn]
	);

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

const ChatContextConsumer = ChatContext.Consumer;

export { ChatContext, ChatContextConsumer, ChatContextProvider };
