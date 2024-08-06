import { Block } from '@mezon/mobile-ui';
import React from 'react';

import { NotificationCode } from '@mezon/utils';
import NotificationIndividualItem from '../NotificationIndividualItem';
import NotificationMentionItem from '../NotificationMentionItem';
import { NotifyProps } from '../types';

const NotificationItem = React.memo(({ notify, onLongPressNotify, onPressNotify }: NotifyProps) => {
	return (
		<Block>
			{notify?.code !== NotificationCode.USER_MENTIONED && notify?.code !== NotificationCode.USER_REPLIED ? (
				<NotificationIndividualItem onPressNotify={onPressNotify} notify={notify} onLongPressNotify={onLongPressNotify} />
			) : null}
			{notify?.code === NotificationCode.USER_MENTIONED || notify?.code === NotificationCode.USER_REPLIED ? (
				<NotificationMentionItem onPressNotify={onPressNotify} notify={notify} onLongPressNotify={onLongPressNotify} />
			) : null}
		</Block>
	);
});

export default NotificationItem;
