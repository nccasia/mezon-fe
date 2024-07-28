import { IMessageWithUser } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import MessageWithUser from '../../MessageWithUser';

type ChannelMessageThreadProps = {
	message: IMessageWithUser;
};

const ChannelMessageThread = (props: ChannelMessageThreadProps) => {
	const { message } = props;
	return (
		<div className="mb-3">
			<MessageWithUser
				message={message}
				isMessNotifyMention={true}
				mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
				isMention={true}
				isShowFull={true}
			/>
		</div>
	);
};

export default ChannelMessageThread;
