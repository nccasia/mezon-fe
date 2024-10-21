import { Block, Colors, size, Text, useTheme } from '@mezon/mobile-ui';
import { selectLastSeenMessage } from '@mezon/store-mobile';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';

interface INewMessageRedLineProps {
	messageId: string;
	channelId: string;
	isEdited?: boolean;
	isSending?: boolean;
	isMe?: boolean;
}

export const NewMessageRedLine = memo((props: INewMessageRedLineProps) => {
	const { channelId = '', messageId = '', isEdited = false, isSending = false, isMe = false } = props;
	const { themeValue } = useTheme();
	const { t } = useTranslation('message');
	const lastSeen = useSelector(selectLastSeenMessage(channelId, messageId));
	const isUnread = useMemo(() => {
		return lastSeen && !isEdited && !isSending && !isMe;
	}, [lastSeen, isEdited, isSending, isMe]);

	return (
		<Block alignItems="center">
			{isUnread && (
				<Block height={1} width={'95%'} backgroundColor={Colors.red} margin={size.s_10}>
					<Block position="absolute" left={0} alignItems="center" width={'100%'}>
						<Block paddingHorizontal={size.s_10} marginTop={-size.s_10} backgroundColor={themeValue.primary}>
							<Text color={Colors.red} style={{ top: Platform.OS === 'ios' ? size.s_4 : 0 }}>
								{t('newMessages')}
							</Text>
						</Block>
					</Block>
				</Block>
			)}
		</Block>
	);
});
