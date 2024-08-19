import { handleUrlInput } from '@mezon/transport';
import { ETypeLinkMedia, IMessageSendPayload } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention } from 'mezon-js/api.gen';
import { useCallback, useMemo } from 'react';

type UseProcessLinkOptions = {
	updateImageLinkMessage: (
		clanId: string,
		channelId: string,
		mode: number,
		content: IMessageSendPayload,
		messageId: string,
		mentions: ApiMessageMention[],
		attachments?: ApiMessageAttachment[],
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
		) => {
			if (!contentPayload?.lk) return;

			const resultPromises = contentPayload.lk.map((item) =>
				handleUrlInput(contentPayload.t?.substring(item.s ?? 0, item.e) as string).then((result) => {
					if (result.filetype && result.filetype.startsWith(ETypeLinkMedia.IMAGE_PREFIX)) {
						return result as ApiMessageAttachment;
					}
					return null;
				}),
			);

			Promise.all(resultPromises)
				.then((results) => {
					const filteredImageAttachments = results.filter((result): result is ApiMessageAttachment => result !== null);

					const combinedAttachments = [...(attachmentPayload ?? []), ...filteredImageAttachments];

					if (combinedAttachments.length > 0) {
						updateImageLinkMessage(
							clanId,
							channelId,
							mode,
							contentPayload,
							newMessageIdUpdateImage ?? '',
							mentionPayload ?? [],
							combinedAttachments,
						);
					}
				})
				.catch((error) => {
					console.error('Error processing content payload:', error);
				});
		},
		[updateImageLinkMessage],
	);

	return useMemo(
		() => ({
			processLink,
		}),
		[processLink],
	);
}
