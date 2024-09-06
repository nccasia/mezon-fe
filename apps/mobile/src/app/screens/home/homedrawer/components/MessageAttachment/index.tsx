import { IMessageWithUser, notImplementForGifOrStickerSendFromPanel } from '@mezon/utils';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { isImage, isVideo } from '../../../../../utils/helpers';
import { RenderDocumentsChat } from '../RenderDocumentsChat';
import { RenderImageChat } from '../RenderImageChat';
import { RenderVideoChat } from '../RenderVideoChat';

interface IProps {
	message: IMessageWithUser;
	onLongPressImage: () => void;
	onOpenImage?: (image: ApiMessageAttachment) => void;
}
const classifyAttachments = (attachments: ApiMessageAttachment[]) => {
	const videos: ApiMessageAttachment[] = [];
	const images: ApiMessageAttachment[] = [];
	const documents: ApiMessageAttachment[] = [];

	attachments.forEach((attachment) => {
		if (attachment.filetype?.indexOf('video/mp4') !== -1 && !attachment.url?.includes('tenor.com')) {
			videos.push(attachment);
		} else if (attachment.filetype?.indexOf('image/png') !== -1 || attachment.filetype?.indexOf('image/jpeg') !== -1) {
			images.push(attachment);
		} else {
			documents.push(attachment);
		}
	});

	return { videos, images, documents };
};

export const MessageAttachment = React.memo(({ message, onOpenImage, onLongPressImage }: IProps) => {
	const attachments = useMemo(() => {
		return message?.attachments || [];
	}, [message?.attachments]);

	const [videos, setVideos] = useState<ApiMessageAttachment[]>([]);
	const [images, setImages] = useState<ApiMessageAttachment[]>([]);
	const [documents, setDocuments] = useState<ApiMessageAttachment[]>([]);

	useEffect(() => {
		const { videos, images, documents } = classifyAttachments(attachments ?? []);
		setVideos(videos);
		setImages(images);
		setDocuments(documents);
	}, [attachments]);

	const onPressImage = useCallback(
		(image: any) => {
			onOpenImage?.({
				...image,
				uploader: message.sender_id,
				create_time: message.create_time
			});
		},
		[message.create_time, message.sender_id, onOpenImage]
	);

	const renderDocuments = () => {
		return documents.map((document, index) => {
			if (!document?.url) {
				return null;
			}
			const isShowImage = isImage(document?.url?.toLowerCase());
			if (isShowImage) {
				const checkImage = notImplementForGifOrStickerSendFromPanel(document);

				return (
					<RenderImageChat
						disable={checkImage}
						image={document}
						key={`${document?.url}_${index}`}
						onPress={onPressImage}
						onLongPress={onLongPressImage}
					/>
				);
			}
			const checkIsVideo = isVideo(document?.url?.toLowerCase());

			if (checkIsVideo) {
				return <RenderVideoChat key={`${document?.url}_${index}`} videoURL={document.url} />;
			}

			return (
				<RenderDocumentsChat
					key={`${document?.url}_${index}`}
					document={document}
					onLongPress={onLongPressImage}
					onPressImage={onPressImage}
				/>
			);
		});
	};

	return (
		<View>
			{videos?.length > 0 && videos.map((video, index) => <RenderVideoChat key={`${video?.url}_${index}`} videoURL={video?.url} />)}
			{images?.length > 0 &&
				images.map((image, index) => {
					const checkImage = notImplementForGifOrStickerSendFromPanel(image);
					return (
						<RenderImageChat
							disable={checkImage}
							image={image}
							key={`${image?.url}_${index}`}
							onPress={onPressImage}
							onLongPress={onLongPressImage}
						/>
					);
				})}
			{documents?.length > 0 && renderDocuments()}
		</View>
	);
});
