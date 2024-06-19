import {  createAsyncThunk } from '@reduxjs/toolkit';
import { ensureSession, getMezonCtx } from '../helpers';
import { channelMembersActions } from '../channelmembers/channel.members';
import { rolesClanActions } from '../roleclan/roleclan.slice';

type addChannelUsersPayload = {
	channelId: string;
	channelType?: number;
    userIds: string[];
};
export const addChannelUsers = createAsyncThunk('channelUsers/addChannelUsers', async ( {channelId, channelType, userIds} : addChannelUsersPayload, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.addChannelUsers(mezon.session, channelId, userIds);
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		const body ={
			clanId: '', 
			channelId: channelId, 
			noCache: true, 
			channelType: channelType ?? 0,
			repace : true
		}
		thunkAPI.dispatch(channelMembersActions.fetchChannelMembers(body))
		return response;
	} catch(error : any) {		
		const errmsg = await error.json();
		return thunkAPI.rejectWithValue(errmsg.message);
	}
});

type removeChannelUsersPayload = {
	channelId: string;
    userId: string
};

export const removeChannelUsers = createAsyncThunk('channelUsers/removeChannelUsers', async ( {channelId, userId} : removeChannelUsersPayload, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const userIds = [userId]
		const response = await mezon.client.removeChannelUsers(mezon.session, channelId, userIds);
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		thunkAPI.dispatch(channelMembersActions.remove(`${channelId}${userId}`))
		return response;
	} catch(error : any) {		
		const errmsg = await error.json();
		return thunkAPI.rejectWithValue(errmsg.message);
	}
});

type addChannelRolesPayload = {
	clanId: string
	channelId: string;
	channelType?: number;
    roleIds: string[];
};
export const addChannelRoles = createAsyncThunk('channelUsers/addChannelRoles', async ( {clanId, channelId, roleIds, channelType} : addChannelRolesPayload, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.addRolesChannelDesc(mezon.session, {channel_id: channelId, role_ids: roleIds});
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		const bodyFetchUsers ={
			clanId: '', 
			channelId: channelId, 
			noCache: true, 
			channelType: channelType ?? 0,
			repace : true
		}
		const bodyFetchRoles ={
			clanId: clanId, 
			channelId: channelId, 
			repace : true
		}
		thunkAPI.dispatch(channelMembersActions.fetchChannelMembers(bodyFetchUsers))
		thunkAPI.dispatch(rolesClanActions.fetchRolesClan(bodyFetchRoles))
		return response;
	} catch(error : any) {		
		const errmsg = await error.json();
		return thunkAPI.rejectWithValue(errmsg.message);
	}
});

type removeChannelRolePayload = {
	clanId: string;
	channelId: string;
    roleId: string;
	channelType?: number;
};
export const removeChannelRole = createAsyncThunk('channelUsers/removeChannelRole', async ( {channelId, clanId, roleId, channelType} : removeChannelRolePayload, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await mezon.client.deleteRoleChannelDesc(mezon.session, {channel_id: channelId, role_id: roleId});
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		const body ={
			clanId: '', 
			channelId: channelId, 
			noCache: true, 
			channelType: channelType ?? 0,
			repace : true
		}
		thunkAPI.dispatch(channelMembersActions.fetchChannelMembers(body))
		const bodyFetchRoles ={
			clanId: clanId, 
			channelId: channelId, 
			repace : true
		}
		thunkAPI.dispatch(rolesClanActions.fetchRolesClan(bodyFetchRoles))
		return response;
	} catch(error : any) {		
		const errmsg = await error.json();
		return thunkAPI.rejectWithValue(errmsg.message);
	}
});
export const channelUsersActions = { addChannelUsers, removeChannelUsers, addChannelRoles, removeChannelRole };