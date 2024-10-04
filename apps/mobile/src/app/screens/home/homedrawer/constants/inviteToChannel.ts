import { EMaxUserCanInvite } from '../enums';
import { IExpireLinkOption } from '../types';

//TODO: update later when BE is ready
export enum ExpireLinkValue {
	Never = 'Never',
	SevenDays = '7 days',
	OneDay = '1 day',
	TwelveHours = '12 hours',
	SixHours = '6 hours',
	OneHour = '1 hour',
	ThirtyMinutes = '30 minutes'
}

export const LINK_EXPIRE_OPTION: IExpireLinkOption[] = [
	{
		value: ExpireLinkValue.Never,
		label: 'NEVER'
	},
	{
		value: ExpireLinkValue.SevenDays,
		label: '7 DAYS'
	},
	{
		value: ExpireLinkValue.OneDay,
		label: '1 DAY'
	},
	{
		value: ExpireLinkValue.TwelveHours,
		label: '12 HOURS'
	},
	{
		value: ExpireLinkValue.SixHours,
		label: '6 HOURS'
	},
	{
		value: ExpireLinkValue.OneHour,
		label: '1 HOURS'
	},
	{
		value: ExpireLinkValue.ThirtyMinutes,
		label: '30 MINS'
	}
];

export const MAX_USER_OPTION = [
	EMaxUserCanInvite.Infinity,
	EMaxUserCanInvite.One,
	EMaxUserCanInvite.Five,
	EMaxUserCanInvite.Ten,
	EMaxUserCanInvite.TwentyFive,
	EMaxUserCanInvite.Fifty,
	EMaxUserCanInvite.OneHundred
];
