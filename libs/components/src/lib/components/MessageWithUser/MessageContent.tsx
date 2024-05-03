import { IChannelMember, IMessageWithUser, notImplementForGifOrStickerSendFromPanel } from '@mezon/utils';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import { useEffect, useState } from 'react';
import MessageImage from './MessageImage';
import MessageLine from './MessageLine';
import MessageLinkFile from './MessageLinkFile';
import MessageVideo from './MessageVideo';
import { useMessageParser } from './useMessageParser';

type IMessageContentProps = {
	user?: IChannelMember | null;
	message: IMessageWithUser;
	isCombine?: boolean;
	newMessage?: string;
};

const MessageContent = ({ user, message, isCombine, newMessage }: IMessageContentProps) => {
	const { attachments, lines } = useMessageParser(message);
	const [videos, setVideos] = useState<ApiMessageAttachment[]>([]);
	const [images, setImages] = useState<ApiMessageAttachment[]>([]);
	const [documents, setDocuments] = useState<ApiMessageAttachment[]>([]);
	console.log(videos);

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

	useEffect(() => {
		const { videos, images, documents } = classifyAttachments(attachments ?? []);
		setVideos(videos);
		setImages(images);
		setDocuments(documents);
	}, [attachments]);

	const renderVideos = () => {
		return (
			<div className="flex flex-row justify-start flex-wrap w-full gap-2 mt-5">
				{videos.map((video, index) => (
					<div key={video.url} className="w-fit gap-y-2">
						<MessageVideo attachmentData={video} />
					</div>
				))}
			</div>
		);
	};

	const renderImages = () => {
		return (
			<div className="flex flex-row justify-start flex-wrap w-full gap-x-2">
				{images.map((image, index) => {
					const checkImage = notImplementForGifOrStickerSendFromPanel(image);
					return (
						<div key={image.url} className={`${checkImage ? '' : 'w-48 h-auto'}  `}>
							<MessageImage attachmentData={image} />
						</div>
					);
				})}
			</div>
		);
	};

	const renderDocuments = () => {
		return documents.map((document, index) => {
			return <MessageLinkFile key={document.url} attachmentData={document} />;
		});
	};

	return (
		<>
			{videos.length > 0 && renderVideos()}
			{images.length > 0 && renderImages()}
			{documents.length > 0 && renderDocuments()}
			{newMessage !== '' ? (
				<div className="flex ">
					<div id={message.id}>
						<MessageLine line={newMessage as string} />
					</div>
					<p className="ml-[5px] opacity-50 text-[9px] self-center">(edit)</p>
				</div>
			) : (
				<div className="flex ">
					<div id={message.id}>
						<MessageLine line={lines as string} />
					</div>
					{message.update_time ? (
						<div className="self-center">
							{message.create_time < message.update_time ? <p className="ml-[5px] opacity-50 text-[9px]">(edited)</p> : null}
						</div>
					) : null}
				</div>
			)}
		</>
	);
};

export default MessageContent;
