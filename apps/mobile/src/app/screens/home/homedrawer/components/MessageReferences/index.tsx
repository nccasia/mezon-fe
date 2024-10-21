import { useGetPriorityNameFromUserClan } from '@mezon/core';
import { AttachmentImageIcon, ReplyIcon } from '@mezon/mobile-components';
import { Colors, Text, size, useTheme } from '@mezon/mobile-ui';
import { messagesActions } from '@mezon/store';
import { useAppDispatch } from '@mezon/store-mobile';
import { ApiMessageRef } from 'mezon-js/api.gen';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { MezonAvatar } from '../../../../../componentUI';
import { RenderTextMarkdownContent } from '../RenderTextMarkdown';
import { style } from './styles';

interface IProps {
	messageReferences?: ApiMessageRef;
	preventAction: boolean;
	isMessageReply?: boolean;
	mode?: number;
	channelId?: string;
	clanId?: string;
}

export const MessageReferences = React.memo(({ messageReferences, preventAction, mode, channelId, clanId }: IProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const dispatch = useAppDispatch();
	const { t } = useTranslation('message');
	const { clanAvatar } = useGetPriorityNameFromUserClan(messageReferences.message_sender_id);

	const handleJumpToMessage = (messageId: string) => {
		requestAnimationFrame(async () => {
			dispatch(
				messagesActions.jumpToMessage({
					clanId: clanId || '',
					messageId: messageId,
					channelId: channelId
				})
			);
		});
	};

	const onPressAvatar = () => {
		if (!preventAction) {
			handleJumpToMessage(messageReferences?.message_ref_id);
		}
	};

	return (
		<Pressable onPress={onPressAvatar} style={styles.aboveMessage}>
			<View style={styles.iconReply}>
				<ReplyIcon width={size.s_34} height={size.s_30} />
			</View>
			<View style={styles.repliedMessageWrapper}>
				<MezonAvatar
					avatarUrl={clanAvatar || messageReferences?.mesages_sender_avatar}
					username={messageReferences?.message_sender_username}
					height={size.s_20}
					width={size.s_20}
				/>
				<View style={styles.replyContentWrapper}>
					<Text style={styles.replyDisplayName}>
						{messageReferences?.message_sender_clan_nick ||
							messageReferences?.message_sender_display_name ||
							messageReferences?.message_sender_username ||
							'Anonymous'}
					</Text>
					{messageReferences?.has_attachment ? (
						<>
							<Text style={styles.tapToSeeAttachmentText}>{t('tapToSeeAttachment')}</Text>
							<AttachmentImageIcon width={size.s_12} height={size.s_12} color={Colors.textGray} />
						</>
					) : (
						<RenderTextMarkdownContent
							content={{
								...(messageReferences.content ? JSON.parse(messageReferences?.content) : {})
							}}
							isEdited={false}
							translate={t}
							isMessageReply
							isNumberOfLine
							mode={mode}
						/>
					)}
				</View>
			</View>
		</Pressable>
	);
});
