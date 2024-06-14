import { selectMemberByUserId } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { useSelector } from 'react-redux';
import MessageWithUser from '../../MessageWithUser';

type MessageChannelProps = {
	message: IMessageWithUser;
};

const MessageChannel = ({ message }: MessageChannelProps) => {
	const user = useSelector(selectMemberByUserId(message.sender_id));
	return (
		<div className="group pb-2 hover:bg-bgLightPrimary dark:hover:bg-bgPrimary1 rounded-lg bg-bgLightPrimary dark:bg-bgPrimary cursor-pointer">
			<MessageWithUser
				message={message as IMessageWithUser}
				user={user}
				isMessNotifyMention={true}
				mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
				newMessage={message.content && JSON.parse(message.content).t}
				isMention={true}
			/>
		</div>
	);
};

export default MessageChannel;
