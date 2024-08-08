import { MezonContextValue } from '@mezon/transport';
import { GetThunkAPI } from '@reduxjs/toolkit';

export type AsyncThunkConfigWithMezon = {
	extra: {
		mezon: MezonContextValue;
	};
};

export type GetThunkAPIWithMezon = GetThunkAPI<AsyncThunkConfigWithMezon>;
