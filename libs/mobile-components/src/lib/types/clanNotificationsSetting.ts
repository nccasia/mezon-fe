import { NotiChannelCategorySettingEntity } from '@mezon/store-mobile';
import { ChannelType, NotificationType } from 'mezon-js';
import { ViewStyle } from 'react-native';

export const optionNotification = [
	{
		title: 'All Message',
		value: NotificationType.ALL_MESSAGE
	},
	{
		title: 'Only @mentions',
		value: NotificationType.MENTION_MESSAGE
	},
	{
		title: 'Nothing',
		value: NotificationType.NOTHING_MESSAGE
	}
];

export enum EOptionOverridesType {
	Category,
	Channel
}
export interface ICategoryChannelOption {
	id: string;
	label: string;
	title: string;
	type: EOptionOverridesType;
}

export type CategoryChannelItemProps = {
	typePreviousIcon: ChannelType | EOptionOverridesType;
	expandable: boolean;
	categoryLabel: string;
	categorySubtext?: string;
	notificationStatus?: number;
	categoryChannelId: string;
	stylesItem?: ViewStyle;
	data?: NotiChannelCategorySettingEntity | ICategoryChannelOption;
};

export const notificationType = {
	[NotificationType.ALL_MESSAGE]: 'All Messages',
	[NotificationType.MENTION_MESSAGE]: '@Mentions',
	[NotificationType.NOTHING_MESSAGE]: 'Nothing'
};
