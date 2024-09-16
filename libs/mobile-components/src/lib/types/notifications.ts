import { ENotificationTypes } from '@mezon/utils';

export enum ENotificationActive {
	ON = 1,
	OFF = 0
}

export enum ENotificationChannelId {
	Default = '0'
}

export const notifyLabels: Record<number, string> = {
	[ENotificationTypes.ALL_MESSAGE]: 'All',
	[ENotificationTypes.MENTION_MESSAGE]: 'Only @mention',
	[ENotificationTypes.NOTHING_MESSAGE]: 'Nothing'
};

export interface IOptionsNotification {
	id: number;
	label: string;
	isChecked: boolean;
	value: ENotificationTypes;
}
