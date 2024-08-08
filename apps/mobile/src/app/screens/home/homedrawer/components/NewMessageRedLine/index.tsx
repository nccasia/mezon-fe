import { Block, Colors, size, Text, useTheme } from '@mezon/mobile-ui';
import { selectLastSeenMessage } from '@mezon/store-mobile';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';

interface INewMessageRedLineProps {
	messageId: string;
	channelId: string;
	isEdited?: boolean;
}

export const NewMessageRedLine = memo((props: INewMessageRedLineProps) => {
	const { channelId = '', messageId = '', isEdited = false } = props;
	const { themeValue } = useTheme();
	const { t } = useTranslation('message');
	const lastSeen = useSelector(selectLastSeenMessage(channelId, messageId));
	return (
		<Block alignItems="center">
			{lastSeen && !isEdited && (
				<Block height={1} width={'95%'} backgroundColor={Colors.red} margin={size.s_10}>
					<Block position="absolute" left={0} alignItems="center" width={'100%'}>
						<Block paddingHorizontal={size.s_10} marginTop={-size.s_10} backgroundColor={themeValue.secondary}>
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
