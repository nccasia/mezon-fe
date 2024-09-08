import { IChannelMember, LoadingStatus, RemoveChannelUsers } from '@mezon/utils';
import { EntityState, GetThunkAPI, PayloadAction, createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/browser';
import memoize from 'memoizee';
import { AddClanUserEvent, ChannelPresenceEvent, ChannelType, StatusPresenceEvent } from 'mezon-js';
import { MezonValueContext, ensureSession, ensureSocket, getMezonCtx } from '../helpers';

const CHANNEL_MEMBERS_CACHED_TIME = 1000 * 60 * 3;
export const CHANNEL_MEMBERS_FEATURE_KEY = 'channelMembers';

/*
 * Update these interfaces according to your requirements.
 */
export interface ChannelMembersEntity extends IChannelMember {
	id: string; // Primary ID
	name?: string;
}

export interface ChannelMemberAvatar {
	avatar: string;
	name: string;
}

export interface ChannelMembersState extends EntityState<ChannelMembersEntity, string> {
	loadingStatus: LoadingStatus;
	error?: string | null;
	currentChannelId?: string | null;
	followingUserIds?: string[];
	onlineStatusUser: Record<string, boolean>;
	customStatusUser: Record<string, string>;
	toFollowUserIds: string[];
	memberChannels: Record<string, string[]>;
}

// TODO: remove channelId from the parameter
export const mapChannelMemberToEntity = (channelRes: any, channelId?: string, userChannelId?: string) => {
	const id = `${channelId}${channelRes.user?.id}`;
	return { ...channelRes, id: id || '', channelId, userChannelId };
};

export const mapUserIdToEntity = (userId: string, username: string, online: boolean) => {
	return { username: username, id: userId, online };
};

export interface ChannelMemberRootState {
	[CHANNEL_MEMBERS_FEATURE_KEY]: ChannelMembersState;
}

function getChannelMemberRootState(thunkAPI: GetThunkAPI<unknown>): ChannelMemberRootState {
	return thunkAPI.getState() as ChannelMemberRootState;
}

export const channelMembersAdapter = createEntityAdapter<ChannelMembersEntity>();

const fetchChannelMembersCached = memoize(
	async (mezon: MezonValueContext, clanId: string, channelId: string, channelType: ChannelType) => {
		const response = await mezon.client.listChannelUsers(mezon.session, clanId, channelId, channelType, 1, 2000, '');
		return { ...response, time: Date.now() };
	},
	{
		promise: true,
		maxAge: CHANNEL_MEMBERS_CACHED_TIME,
		normalizer: (args) => {
			return args[1] + args[2] + args[3] + args[0].session.username;
		}
	}
);

type fetchChannelMembersPayload = {
	clanId: string;
	channelId: string;
	noCache?: boolean;
	channelType: ChannelType;
	repace?: boolean;
};

export const fetchChannelMembers = createAsyncThunk(
	'channelMembers/fetchChannelMembers',
	async ({ clanId, channelId, noCache, channelType, repace = false }: fetchChannelMembersPayload, thunkAPI) => {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));

		if (noCache) {
			fetchChannelMembersCached.clear(mezon, clanId, channelId, channelType);
		}

		const response = await fetchChannelMembersCached(mezon, clanId, channelId, channelType);
		// 		old logic: if (Date.now() - response.time < 100) {
		if (!response.channel_users) {
			return [];
		}
		if (repace) {
			thunkAPI.dispatch(channelMembersActions.removeUserByChannel(channelId));
		}

		const members = response.channel_users.map((channelRes) => mapChannelMemberToEntity(channelRes, channelId, channelRes.id));
		const customStatusInit = members.map((member) => {
			const status = (member?.user?.metadata as any)?.status ?? '';
			return { userId: member.user?.id ?? '', customStatus: status };
		});
		const onlineStatus = response.channel_users.map((item) => {
			return { userId: item.user?.id ?? '', status: item.user?.online ?? false };
		});
		thunkAPI.dispatch(channelMembersActions.setManyCustomStatusUser(customStatusInit));
		thunkAPI.dispatch(channelMembersActions.setMemberChannels({ channelId: channelId, members }));
		thunkAPI.dispatch(channelMembersActions.setManyStatusUser(onlineStatus));
		return members;
	}
);

export const fetchChannelMembersPresence = createAsyncThunk(
	'channelMembers/fetchChannelMembersPresence',
	async (channelPresence: ChannelPresenceEvent, thunkAPI) => {
		if (channelPresence.joins.length > 0) {
			const joinUser = channelPresence.joins[0];
			const userId = joinUser.user_id;
			const user = selectMemberByUserId(userId);
			//check user exist or not
			if (!user) {
				thunkAPI.dispatch(channelMembersActions.addNewMember(channelPresence));
				thunkAPI.dispatch(channelMembersActions.setStatusUser({ userId, status: true }));
				thunkAPI.dispatch(channelMembersActions.setCustomStatusUser({ userId, customStatus: joinUser.status ?? '' }));
			}
		}
	}
);

export const updateStatusUser = createAsyncThunk('channelMembers/fetchUserStatus', async (statusPresence: StatusPresenceEvent, thunkAPI) => {
	if (statusPresence?.leaves?.length) {
		for (const leave of statusPresence.leaves) {
			const userId = leave.user_id;
			thunkAPI.dispatch(channelMembersActions.setStatusUser({ userId, status: false }));
			thunkAPI.dispatch(channelMembersActions.setCustomStatusUser({ userId, customStatus: leave.status }));
		}
	}
	if (statusPresence?.joins?.length) {
		for (const join of statusPresence.joins) {
			const userId = join.user_id;
			thunkAPI.dispatch(channelMembersActions.setStatusUser({ userId, status: true }));
			thunkAPI.dispatch(channelMembersActions.setCustomStatusUser({ userId, customStatus: join.status }));
		}
	}
});

export const removeMemberChannel = createAsyncThunk(
	'channelMembers/removeChannelUser',
	async ({ channelId, userIds, kickMember = true }: RemoveChannelUsers & { kickMember?: boolean }, thunkAPI) => {
		try {
			const mezon = await ensureSession(getMezonCtx(thunkAPI));
			const response = await mezon.client.removeChannelUsers(mezon.session, channelId, userIds);
			if (!response) {
				return;
			}
			if (kickMember) {
				await thunkAPI.dispatch(
					fetchChannelMembers({ clanId: '', channelId: channelId, noCache: true, channelType: ChannelType.CHANNEL_TYPE_TEXT })
				);
				return;
			}

			return true;
		} catch (error) {
			return thunkAPI.rejectWithValue([]);
		}
	}
);

type UpdateCustomStatus = {
	clanId: string;
	customStatus: string;
};

export const updateCustomStatus = createAsyncThunk(
	'channelMembers/updateCustomStatusUser',
	async ({ clanId, customStatus }: UpdateCustomStatus, thunkAPI) => {
		try {
			const mezon = await ensureSocket(getMezonCtx(thunkAPI));
			const response = await mezon.socketRef.current?.writeCustomStatus(clanId, customStatus);
			if (response) {
				return response;
			}
		} catch (e) {
			Sentry.captureException(e);
			console.error('Error updating custom status user', e);
		}
	}
);

export const initialChannelMembersState: ChannelMembersState = channelMembersAdapter.getInitialState({
	loadingStatus: 'not loaded',
	error: null,
	onlineStatusUser: {},
	toFollowUserIds: [],
	customStatusUser: {},
	memberChannels: {}
});

export type StatusUserArgs = {
	userId: string;
	status: boolean;
};

export type CustomStatusUserArgs = {
	userId: string;
	customStatus: string;
};

export const channelMembers = createSlice({
	name: CHANNEL_MEMBERS_FEATURE_KEY,
	initialState: initialChannelMembersState,
	reducers: {
		remove: (state, action: PayloadAction<{ channelId: string; userId: string }>) => {
			const { channelId, userId } = action.payload;
			state.memberChannels[channelId] = state.memberChannels[channelId].filter((memberId) => memberId !== channelId + userId);
		},
		removeUserByChannel: (state, action: PayloadAction<string>) => {
			const channelId = action.payload;
			const membersToRemove = Object.values(state.entities)
				.filter((member) => member.channelId === channelId)
				.map((member) => member.id);

			state.memberChannels[channelId] = state.memberChannels[channelId].filter((member) => !membersToRemove.includes(member));
		},

		removeUserByUserIdAndChannelId: (state, action: PayloadAction<{ userId: string; channelId: string }>) => {
			const { userId, channelId } = action.payload;
			const memberId = channelId + userId;
			state.memberChannels[channelId] = state.memberChannels[channelId].filter((member) => member !== memberId);
		},

		setManyCustomStatusUser: (state, action: PayloadAction<CustomStatusUserArgs[]>) => {
			for (const i of action.payload) {
				state.customStatusUser[i.userId] = i.customStatus;
			}
		},
		setManyStatusUser: (state, action: PayloadAction<StatusUserArgs[]>) => {
			const allMemberChannels = channelMembersAdapter.getSelectors().selectAll(state);

			channelMembersAdapter.updateMany(
				state,
				allMemberChannels.map((member) => {
					const memberUpdate = action.payload.find((memberUpdate) => memberUpdate.userId === member.user?.id);
					if (member.user?.id === memberUpdate?.userId) {
						return {
							id: member.id,
							changes: {
								...member,
								user: {
									...member.user,
									online: memberUpdate?.status
								}
							}
						};
					}
					return {
						id: member.id,
						changes: { ...member }
					};
				})
			);
		},
		addUserJoinClan: (state, action: PayloadAction<AddClanUserEvent>) => {
			const { user, clan_id } = action.payload;

			const channelIds = [
				...new Set(
					Object.values(state.entities).map((channelUser) => {
						return channelUser.channelId;
					})
				)
			];

			const member = mapUserIdToEntity(user.user_id, user.username, true);
			const allMemberChannels = channelIds.map((channelId) => {
				return mapChannelMemberToEntity(
					{ id: member.id + channelId, user: { ...member, avatar_url: user.avatar }, clan_id },
					channelId,
					user.user_id
				);
			});

			channelMembersAdapter.addMany(state, allMemberChannels);
			// state.memberChannels[channelId].push();
		},
		setFollowingUserIds: (state: ChannelMembersState, action: PayloadAction<string[]>) => {
			state.followingUserIds = action.payload;
		},
		setStatusUser: (state, action: PayloadAction<StatusUserArgs>) => {
			state.onlineStatusUser[action.payload.userId] = action.payload.status;
		},

		setCustomStatusUser: (state, action: PayloadAction<CustomStatusUserArgs>) => {
			state.customStatusUser[action.payload.userId] = action.payload.customStatus;
		},
		setMemberChannels: (state, action: PayloadAction<{ channelId: string; members: string[] }>) => {
			const { channelId, members } = action.payload;
			if (!state.memberChannels[channelId]) {
				state.memberChannels[channelId] = [];
			}
			state.memberChannels[channelId] = members;
		},
		addNewMember: (state, action: PayloadAction<ChannelPresenceEvent>) => {
			const payload = action.payload;
			const member = mapUserIdToEntity(payload.joins[0].user_id, payload.joins[0].username, true);
			const data = mapChannelMemberToEntity({ id: member.id + payload.channel_id, user: member }, payload.channel_id, payload.joins[0].user_id);
			state.memberChannels[payload.channel_id].push(payload.joins[0].user_id);
		},
		addRoleIdUser: (state, action) => {
			const { id, channelId, userId } = action.payload;
			const idMember = channelId + userId;
			const existingMember = state.entities[idMember];

			if (existingMember) {
				const roleIds = existingMember.role_id || [];
				const updatedRoleIds = [...roleIds, id];
				existingMember.role_id = updatedRoleIds;
			}
		},
		removeRoleIdUser: (state, action) => {
			const { id, channelId, userId } = action.payload;
			const idMember = channelId + userId;
			const existingMember = state.entities[idMember];

			if (existingMember) {
				const roleIds = existingMember?.role_id || [];
				const roleIndex = roleIds.indexOf(id);
				let updatedRoleIds;
				if (roleIndex > -1) {
					updatedRoleIds = roleIds.filter((roleId) => roleId !== id);
				}
				existingMember.role_id = updatedRoleIds;
			}
		},
		updateUserChannel: (state, action: PayloadAction<{ userId: string; clanId: string; clanNick: string; clanAvt: string }>) => {
			const { userId, clanId, clanNick, clanAvt } = action.payload;
			const channelsToUpdate = Object.values(state.entities).filter((channel) => channel?.clan_id === clanId && channel?.user?.id === userId);
			channelsToUpdate.forEach((channel) => {
				if (channel) {
					channelMembersAdapter.updateOne(state, {
						id: channel.id,
						changes: {
							clan_nick: clanNick,
							clan_avatar: clanAvt
						}
					});
				}
			});
		},

		removeUserByUserIdAndClanId: (state, action: PayloadAction<{ userId: string; clanId: string }>) => {
			const { userId, clanId } = action.payload;
			const ids = Object.values(state.entities)
				.filter((channelUser) => channelUser.clan_id === clanId && channelUser.user?.id === userId)
				.map((message) => message.id);
			channelMembersAdapter.removeMany(state, ids);
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchChannelMembers.pending, (state: ChannelMembersState) => {
				state.loadingStatus = 'loading';
			})
			.addCase(fetchChannelMembers.fulfilled, (state: ChannelMembersState, action: PayloadAction<IChannelMember[] | null>) => {
				if (action.payload !== null) {
					channelMembersAdapter.setAll(state, action.payload);
					state.loadingStatus = 'loaded';
				} else {
					state.loadingStatus = 'not loaded';
				}
			})
			.addCase(fetchChannelMembers.rejected, (state: ChannelMembersState, action) => {
				state.loadingStatus = 'error';
				state.error = action.error.message;
			})
			.addCase(updateCustomStatus.fulfilled, (state: ChannelMembersState, action) => {
				if (action.payload) {
					state.customStatusUser[action.payload?.user_id] = action.payload.status;
				}
			});
	}
});

export const channelMembersReducer = channelMembers.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(channelMembersActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const channelMembersActions = {
	...channelMembers.actions,
	fetchChannelMembers,
	fetchChannelMembersPresence,
	updateStatusUser,
	removeMemberChannel,
	updateCustomStatus
};

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(fetchChannelMembers);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities, selectById } = channelMembersAdapter.getSelectors();

export const getChannelMembersState = (rootState: { [CHANNEL_MEMBERS_FEATURE_KEY]: ChannelMembersState }): ChannelMembersState =>
	rootState[CHANNEL_MEMBERS_FEATURE_KEY];

export const selectAllChannelMembers = createSelector(getChannelMembersState, selectAll);

export const selectChannelMembersEntities = createSelector(getChannelMembersState, (state) =>
	channelMembersAdapter.getSelectors().selectEntities(state)
);

export const selectFollowingUserIds = createSelector(getChannelMembersState, (state) => state.followingUserIds);

export const selectAllUserIds = createSelector(selectChannelMembersEntities, (entities) => {
	const members = Object.values(entities);
	return members.filter((item) => item.user?.id).map((member) => member.user?.id as string);
});

export const selectAllUserIdsToFollow = createSelector(getChannelMembersState, (state) => {
	return state.toFollowUserIds;
});

export const selectMembersByChannelId = (channelId?: string | null) =>
	createSelector(selectChannelMembersEntities, (entities) => {
		const members = Object.values(entities);
		return members.filter((member) => member && member.user !== null && member.channelId === channelId);
	});

export const selectUserChannelById = (userID: string, channelID: string) =>
	createSelector(selectMembersByChannelId(channelID), (members) => {
		return members.find((member) => member.id === channelID + userID) || null;
	});

export const selectMemberByGoogleId = (googleId: string) =>
	createSelector(selectAllChannelMembers, (members) => {
		return members.find((member) => member.user?.google_id === googleId);
	});

export const selectMembersMap = (channelId?: string | null) =>
	createSelector(selectChannelMembersEntities, (entities) => {
		const retval = new Map<string, ChannelMemberAvatar>();
		const members = Object.values(entities);

		members
			.filter((member) => member && member.user !== null && member.user?.id && member.channelId === channelId)
			.map((member) => {
				const key = member.user?.id as string;
				retval.set(key, { name: member.user?.username || '', avatar: member.user?.avatar_url || '' });
			});

		return retval;
	});

export const selectMemberStatus = createSelector(getChannelMembersState, (state) => state.onlineStatusUser);

export const selectCustomUserStatus = createSelector(getChannelMembersState, (state) => state.customStatusUser);

export const selectMemberChannels = (channelId: string) =>
	createSelector(getChannelMembersState, (state) => {
		return state.memberChannels[channelId] || [];
	});

export const selectMemberIdByChannelId = (channelId?: string | null) =>
	createSelector(selectChannelMembersEntities, (entities) => {
		const members = Object.values(entities);
		return members.map((member) => member?.user?.id);
	});

export const selectMemberOnlineStatusById = (userId: string) =>
	createSelector(selectChannelMembersEntities, (entities) => {
		const entitiesArray = Object.values(entities);
		const member = entitiesArray.find((member) => member?.user?.id === userId);
		return member?.user?.online || false;
	});

export const selectMemberCustomStatusById = (userId: string) =>
	createSelector(selectCustomUserStatus, (customStatus) => {
		return customStatus?.[userId] || '';
	});

export const selectChannelMemberByUserIds = (channelId: string, userIds: string[]) =>
	createSelector(selectChannelMembersEntities, (entities) => {
		const members = Object.values(entities);
		return members.filter((member) => userIds && member?.user?.id && member.channelId === channelId && userIds.includes(member?.user?.id));
	});

export const selectMemberByUserId = (userId: string) =>
	createSelector(selectAllChannelMembers, (entities) => {
		return entities.find((ent) => ent?.user?.id === userId) || null;
	});
