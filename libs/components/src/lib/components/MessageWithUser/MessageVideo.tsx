import { ApiMessageAttachment } from 'mezon-js/api.gen';

export type MessageImage = {
	readonly attachmentData: ApiMessageAttachment;
};

function MessageVideo({ attachmentData }: MessageImage) {
	return (
		<div className="relative w-full h-[200px]">
			<video src={attachmentData.url} controls={true} autoPlay={false} className="w-full h-full object-cover"></video>
		</div>
	);
}

export default MessageVideo;
