import { selectMemberByUserId } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { useSelector } from 'react-redux';
import MessageWithUser from '../../MessageWithUser';

type ChannelMessageThreadProps = {
	message: IMessageWithUser;
};

const ChannelMessageThread = (props: ChannelMessageThreadProps) => {
	const { message } = props;
	const user = useSelector(selectMemberByUserId(message.sender_id));
	return (
		<div className="mb-3">
			<MessageWithUser
				message={message}
				user={user}
				isMessNotifyMention={true}
				mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
				newMessage={message.content.t}
				isMention={true}
			/>
		</div>
	);
};

export default ChannelMessageThread;
