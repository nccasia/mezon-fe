import { AttachmentImageIcon, ReplyIcon } from '@mezon/mobile-components';
import { Colors, Text, useTheme } from '@mezon/mobile-ui';
import { messagesActions } from '@mezon/store';
import { useAppDispatch } from '@mezon/store-mobile';
import { MezonAvatar } from 'apps/mobile/src/app/temp-ui';
import { ApiMessageRef } from 'mezon-js/api.gen';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { RenderTextMarkdownContent } from '../RenderTextMarkdown';
import { style } from './styles';

interface IProps {
	messageReferences?: ApiMessageRef;
	preventAction: boolean;
	jumpToRepliedMessage?: (messageId: string) => void;
	isMessageReply?: boolean;
	mode?: number;
}

export const MessageReferences = React.memo(({ messageReferences, preventAction, jumpToRepliedMessage, mode }: IProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const dispatch = useAppDispatch();
	const { t } = useTranslation('message');

	const handleJumpToMessage = (messageId: string) => {
		dispatch(messagesActions.setIdMessageToJump(messageId));
		jumpToRepliedMessage(messageReferences?.message_ref_id);
	};

	const onPressAvatar = () => {
		if (!preventAction) {
			handleJumpToMessage(messageReferences?.message_ref_id);
		}
	};

	return (
		<View style={styles.aboveMessage}>
			<View style={styles.iconReply}>
				<ReplyIcon width={34} height={30} />
			</View>
			<Pressable onPress={onPressAvatar} style={styles.repliedMessageWrapper}>
				<MezonAvatar
					avatarUrl={messageReferences?.mesages_sender_avatar}
					username={messageReferences?.message_sender_username}
					height={20}
					width={20}
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
							<AttachmentImageIcon width={13} height={13} color={Colors.textGray} />
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
			</Pressable>
		</View>
	);
});
