import { handleUrlInput } from '@mezon/transport';
import { ETypeLinkMedia, IMessageSendPayload, IMessageWithUser } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention } from 'mezon-js/api.gen';
import { useCallback, useMemo } from 'react';

type UseProcessLinkOptions = {
	updateImageLinkMessage: (
		clanId?: string,
		channelId?: string,
		mode?: number,
		content?: IMessageSendPayload,
		messageId?: string,
		mentions?: ApiMessageMention[],
		attachments?: ApiMessageAttachment[],
		messageEdit?: IMessageWithUser,
		hideEditted?: boolean
	) => Promise<void>;
};

export function useProcessLink({ updateImageLinkMessage }: UseProcessLinkOptions) {
	const processLink = useCallback(
		(
			clanId: string,
			channelId: string,
			mode: number,
			contentPayload?: IMessageSendPayload,
			mentionPayload?: ApiMessageMention[],
			attachmentPayload?: ApiMessageAttachment[],
			newMessageIdUpdateImage?: string,
			messageEdit?: IMessageWithUser
		) => {
			if (!contentPayload?.lk && messageEdit?.attachments && messageEdit?.attachments?.length > 0) {
				const filteredAttachments =
					messageEdit?.attachments?.filter(
						(attachment) =>
							attachment.url &&
							attachment?.filetype?.startsWith(ETypeLinkMedia.IMAGE_PREFIX) &&
							!attachment.url.startsWith('https://cdn.mezon.vn') &&
							contentPayload?.t &&
							!contentPayload.t.includes(attachment.url)
					) ?? [];
				const finalAttachments = messageEdit?.attachments?.filter((attachment) => !filteredAttachments.includes(attachment));
				if (messageEdit?.attachments && messageEdit?.attachments?.length > 0) {
					updateImageLinkMessage(
						clanId,
						channelId,
						mode,
						contentPayload ?? {},
						newMessageIdUpdateImage ?? '',
						mentionPayload ?? [],
						finalAttachments,
						undefined,
						true
					);
				}
			} else if (contentPayload?.lk) {
				const resultPromises = contentPayload.lk.map((item) =>
					handleUrlInput(contentPayload.t?.substring(item.s ?? 0, item.e) as string).then((result) => {
						if (result.filetype && result.filetype.startsWith(ETypeLinkMedia.IMAGE_PREFIX)) {
							return result as ApiMessageAttachment;
						}
						return null;
					})
				);

				Promise.all(resultPromises)
					.then((results) => {
						console.log('results', results);
						const filteredImageAttachments = results.filter((result): result is ApiMessageAttachment => result !== null);
						const combinedAttachments = [...(attachmentPayload ?? []), ...filteredImageAttachments].filter(
							(attachment, index, self) => index === self.findIndex((a) => a.url === attachment.url)
						);
						if (combinedAttachments.length > 0) {
							updateImageLinkMessage(
								clanId,
								channelId,
								mode,
								contentPayload,
								newMessageIdUpdateImage ?? '',
								mentionPayload ?? [],
								combinedAttachments,
								undefined,
								!messageEdit ? false : true
							);
						}
					})
					.catch((error) => {
						console.error('Error processing content payload:', error);
					});
			}
		},
		[updateImageLinkMessage]
	);

	return useMemo(
		() => ({
			processLink
		}),
		[processLink]
	);
}
