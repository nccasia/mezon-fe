import { INotification } from '@mezon/store-mobile';
import { IMessageWithUser } from '@mezon/utils';
export type NotifyProps = {
	readonly notify: INotification;
};

export interface IMessageNotifyProps {
  message: IMessageWithUser,
  newMessage: string
}

export enum EActionDataNotify  {
  All = 'all',
  Individual = 'individual',
  Mention = "mention",
}
