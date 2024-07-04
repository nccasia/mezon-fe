import { ApiMessageAttachment } from "mezon-js/api.gen";
import { useMemo } from "react";
import MessageVideo from "./MessageVideo";
import MessageImage from "./MessageImage";
import MessageLinkFile from "./MessageLinkFile";
import { IMessageWithUser, notImplementForGifOrStickerSendFromPanel } from "@mezon/utils";
import { useMessageParser } from "./useMessageParser";

type MessageAttachmentProps = {
	message: IMessageWithUser;
	onContextMenu?: (event: React.MouseEvent<HTMLImageElement>) => void;
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

const Attachments: React.FC<{ attachments: ApiMessageAttachment[]; messageId: string, onContextMenu: any }> = ({ attachments, messageId, onContextMenu }) => {
	const { videos, images, documents } = useMemo(() => classifyAttachments(attachments), [attachments]);

	return (
		<>
			{videos.length > 0 && (
				<div className="flex flex-row justify-start flex-wrap w-full gap-2 mt-5">
					{videos.map((video, index) => (
						<div key={`${video.url}_${index}`} className="w-fit gap-y-2">
							<MessageVideo attachmentData={video} />
						</div>
					))}
				</div>
			)}

			{images.length > 0 && (
				<div className="flex flex-row justify-start flex-wrap w-full gap-x-2">
					{images.map((image, index) => {
						const checkImage = notImplementForGifOrStickerSendFromPanel(image);
						return (
							<div key={`${index}_${image.url}`} className={`${checkImage ? '' : 'w-48 h-auto'}  `}>
								<MessageImage attachmentData={image} onContextMenu={onContextMenu}/>
								</div>
						);
					})}
				</div>
			)}

			{documents.length > 0 &&
				documents.map((document, index) => <MessageLinkFile key={`${index}_${document.url}`} attachmentData={document} />)}
		</>
	);
};


// TODO: refactor component for message lines
const MessageAttachment = ({ message, onContextMenu }: MessageAttachmentProps) => {
	const { attachments, hasAttachments } = useMessageParser(message);
	if (!hasAttachments) return null;

	return   <Attachments messageId={message.id} attachments={attachments ?? []} onContextMenu={onContextMenu} />

};

export default MessageAttachment;
