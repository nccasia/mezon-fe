import { AttachmentImageIcon } from '@mezon/mobile-components';
import { Block, Colors } from '@mezon/mobile-ui';
import { selectAllEmojiSuggestion, selectAllUserClanProfile, selectChannelsEntities, selectCurrentClan } from '@mezon/store-mobile';
import { IMessageWithUser } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { useSelector } from 'react-redux';
import { useMessageParser } from '../../../hooks/useMessageParser';
import { renderTextContent } from '../../home/homedrawer/constants';
import { styles } from './MessageNotification.styles';

interface IMessageNotificationProps {
	message: IMessageWithUser;
	channelId: string;
}
const MessageNotification = React.memo(({ message, channelId }: IMessageNotificationProps) => {
	const { attachments, lines } = useMessageParser(message);
	const { t } = useTranslation('message');
	const channelsEntities = useSelector(selectChannelsEntities);
	const emojiListPNG = useSelector(selectAllEmojiSuggestion);
	const clansProfile = useSelector(selectAllUserClanProfile);
	const currentClan = useSelector(selectCurrentClan);

	const isEdited = useMemo(() => {
		if (message?.update_time) {
			const updateDate = new Date(message?.update_time);
			const createDate = new Date(message?.create_time);
			return updateDate > createDate;
		}
		return false;
	}, [message?.update_time, message?.create_time]);
	return (
		<Block>
			{attachments?.length ? (
				<Block style={styles.attachmentBox}>
					<Text style={styles.tapToSeeAttachmentText}>{t('tapToSeeAttachment')}</Text>
					<AttachmentImageIcon width={13} height={13} color={Colors.textGray} />
				</Block>
			) : null}
			<Block>
				{renderTextContent({
					lines,
					isEdited,
					translate: t,
					channelsEntities,
					emojiListPNG,
					isNumberOfLine: true,
					clansProfile,
					currentClan,
					isMessageReply: false,
					mode: ChannelStreamMode.STREAM_MODE_CHANNEL,
				})}
			</Block>
		</Block>
	);
});

export default MessageNotification;
