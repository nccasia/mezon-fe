import { IMessageWithUser } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import MessageWithUser from '../../MessageWithUser';

type MessageChannelProps = {
	message: IMessageWithUser;
};

const MessageChannel = ({ message }: MessageChannelProps) => {
	return (
		<div className="group pb-2 hover:bg-bgLightPrimary dark:hover:bg-bgPrimary1 rounded-lg bg-bgLightPrimary dark:bg-bgPrimary cursor-pointer">
			<MessageWithUser
				message={message as IMessageWithUser}
				isMessNotifyMention={true}
				mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
				isMention={true}
			/>
		</div>
	);
};

export default MessageChannel;
