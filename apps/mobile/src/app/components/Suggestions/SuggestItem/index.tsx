import { useCheckVoiceStatus } from '@mezon/core';
import { useTheme } from '@mezon/mobile-ui';
import { useTranslation } from 'react-i18next';
import { Icons, ThreadIcon, ThreadIconLocker } from '@mezon/mobile-components';
import { ChannelsEntity } from '@mezon/store-mobile';
import { ChannelStatusEnum, getSrcEmoji } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { Image, Text, View } from 'react-native';
import { style } from './SuggestItem.styles';

type SuggestItemProps = {
	avatarUrl?: string;
	name: string;
	subText?: string;
	isDisplayDefaultAvatar?: boolean;
	isRoleUser?: boolean;
	emojiId?: string;
	channelId?: string;
	channel?: ChannelsEntity;
};

const SuggestItem = ({ channelId, avatarUrl, name, subText, isDisplayDefaultAvatar, isRoleUser, emojiId, channel }: SuggestItemProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const emojiSrc = emojiId ? getSrcEmoji(emojiId) : '';
	const { t } = useTranslation(['clan']);

	const isVoiceActive = useCheckVoiceStatus(channelId);
	return (
		<View style={styles.wrapperItem}>
			<View style={styles.containerItem}>
				{avatarUrl ? (
					<Image
						style={styles.image}
						source={{
							uri: avatarUrl,
						}}
					/>
				) : (
					!name.startsWith('here') &&
					!isRoleUser &&
					isDisplayDefaultAvatar && (
						<View style={styles.avatarMessageBoxDefault}>
							<Text style={styles.textAvatarMessageBoxDefault}>{name?.charAt(0)?.toUpperCase()}</Text>
						</View>
					)
				)}
				{emojiSrc && <Image style={styles.emojiImage} source={{ uri: emojiSrc }} />}
				{channel?.channel_private !== ChannelStatusEnum.isPrivate &&
					channel?.type === ChannelType.CHANNEL_TYPE_TEXT &&
					channel?.parrent_id === '0' && <Icons.TextIcon width={16} height={16} color={themeValue.channelNormal} />}
				{channel?.channel_private === ChannelStatusEnum.isPrivate &&
					channel?.type === ChannelType.CHANNEL_TYPE_TEXT &&
					channel?.parrent_id === '0' && <Icons.TextLockIcon width={16} height={16} color={themeValue.channelNormal} />}
				{channel?.channel_private !== ChannelStatusEnum.isPrivate &&
					channel?.type === ChannelType.CHANNEL_TYPE_TEXT &&
					channel?.parrent_id !== '0' && <ThreadIcon width={16} height={16} color={themeValue.channelNormal} />}

				{channel?.channel_private === ChannelStatusEnum.isPrivate &&
					channel?.type === ChannelType.CHANNEL_TYPE_TEXT &&
					channel?.parrent_id !== '0' && <ThreadIconLocker width={16} height={16} color={themeValue.channelNormal} />}
				{(!channel?.channel_private || channel?.channel_private !== ChannelStatusEnum.isPrivate) &&
					channel?.type === ChannelType.CHANNEL_TYPE_VOICE && (
						<Icons.VoiceNormalIcon width={16} height={16} color={themeValue.channelNormal} />
					)}
				{channel?.channel_private === ChannelStatusEnum.isPrivate && channel?.type === ChannelType.CHANNEL_TYPE_VOICE && (
					<Icons.VoiceLockIcon width={16} height={16} color={themeValue.channelNormal} />
				)}
				{isRoleUser || name.startsWith('here') ? (
					<Text style={[styles.roleText, name.startsWith('here') && styles.textHere]}>{`@${name}`}</Text>
				) : (
					<View style={styles.channelWrapper}>
						<Text style={styles.title}>{name}</Text>
						{isVoiceActive &&
							<Text style={styles.channelBusyText}>
								({t('busy')})
							</Text>
						}
					</View>
				)}
			</View>
			<Text style={styles.subText}>{subText}</Text>
		</View>
	);
};

export default SuggestItem;
