import { IMessageWithUser, INotification } from '@mezon/utils';
export type NotifyProps = {
	readonly notify: INotification;
	onLongPressNotify?: (type: ENotifyBsToShow, notify: INotification) => void;
	onPressNotify?: (notify: INotification) => void;
};

export interface IMessageNotifyProps {
	message: IMessageWithUser;
	newMessage: string;
}

export enum EActionDataNotify {
	All = 'all',
	Individual = 'individual',
	Mention = 'mention'
}

export enum ENotifyBsToShow {
	notification,
	removeNotification
}
