import {  createAsyncThunk } from '@reduxjs/toolkit';
import { MezonValueContext, ensureSession, getMezonCtx } from '../helpers';
import memoize from 'memoizee';

const REGIS_FCM_TOKEN_CACHED_TIME = 1000 * 60 * 3;

type FcmDeviceTokenPayload = {
	tokenId: string;
	deviceId: string;
	platform?: string;
};

export const registFcmDeviceTokenCached = memoize(
	(mezon: MezonValueContext, tokenId: string, deviceId: string, platform: string) =>
		mezon.client.registFCMDeviceToken(mezon.session, tokenId, deviceId, platform || ""),
	{
		promise: true,
		maxAge: REGIS_FCM_TOKEN_CACHED_TIME,
		normalizer: (args) => {
			return args[1] + args[2] + args[3] + args[0].session.username;
		},
	},
);

export const registFcmDeviceToken = createAsyncThunk('fcm/registFcmDeviceToken', async ( {tokenId, deviceId, platform}:FcmDeviceTokenPayload, thunkAPI) => {
	try {
		const mezon = await ensureSession(getMezonCtx(thunkAPI));
		const response = await registFcmDeviceTokenCached(mezon, tokenId, deviceId, platform || "");
		if (!response) {
			return thunkAPI.rejectWithValue([]);
		}
		return response;
	} catch(error : any) {		
		const errmsg = await error.json();
		return thunkAPI.rejectWithValue(errmsg.message);
	}
});

export const fcmActions = {  registFcmDeviceToken };