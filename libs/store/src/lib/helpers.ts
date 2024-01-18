import { AsyncThunkConfig, GetThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk";
import { GetThunkAPIWithMezon } from "./typings";
import { MezonContextValue } from "@mezon/transport";
import { Client, Session } from '@heroiclabs/nakama-js';

export const getMezonCtx = (thunkAPI: GetThunkAPI<AsyncThunkConfig>) => {
    if(!isMezonThunk(thunkAPI)) {
        throw new Error('Not Mezon Thunk');
    }
    return thunkAPI.extra.mezon;
}

type MezonValueContext = MezonContextValue & {
    client: Client 
    session: Session
}

export function ensureClient(mezon: MezonContextValue):MezonValueContext  {
    if(!mezon || !mezon.clientRef.current) {
        throw new Error('Error')
    }
    
    return {
        ...mezon,
        client: mezon.clientRef.current,
        session: mezon.sessionRef.current
    } as MezonValueContext
}

export function isMezonThunk(thunkAPI: GetThunkAPI<AsyncThunkConfig>): thunkAPI is GetThunkAPIWithMezon {
    if (thunkAPI === undefined || thunkAPI.extra === undefined) {
        return false;
    }
    if ('extra' in thunkAPI === false || typeof thunkAPI.extra !== 'object' || thunkAPI.extra === null) {
        return false;
    }
    if ('mezon' in thunkAPI.extra === false) {
        return false;
    }
    return  typeof thunkAPI?.extra?.mezon !== 'undefined';
}