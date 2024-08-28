import { ApiMessageAttachment } from 'mezon-js/api.gen';

export type MessageImage = {
	readonly attachmentData: ApiMessageAttachment;
};

function MessageVideo({ attachmentData }: MessageImage) {
	return (
		<div className="relative overflow-hidden w-full h-full max-w-fit rounded-lg">
			<video src={attachmentData.url} controls={true} autoPlay={false} className="w-full h-full object-contain"></video>
		</div>
	);
}

export default MessageVideo;
