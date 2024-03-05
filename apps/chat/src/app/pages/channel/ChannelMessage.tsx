import { MessageWithUser, UnreadMessageBreak } from '@mezon/components';
import { useAccount, useChatMessage, useChatUser } from '@mezon/core';
import { selectMemberByUserId } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

type MessageProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	lastSeen?: boolean;
};

export function ChannelMessage(props: MessageProps) {
	const { message, lastSeen, preMessage } = props;
	const { markMessageAsSeen } = useChatMessage(message.id);
	const user = useSelector(selectMemberByUserId(message.sender_id));
	
	useEffect(() => {
		markMessageAsSeen(message);
	}, [markMessageAsSeen, message]);

	// TODO: recheck this
	const mess = useMemo(() => {
		return message;
	}, [message]);

	const messPre = useMemo(() => {
		return preMessage;
	}, [preMessage]);

	return (
		<div>
			<MessageWithUser
				message={mess as IMessageWithUser} 
				preMessage={messPre as IMessageWithUser}
				user={user}
			/>
			{lastSeen && <UnreadMessageBreak />}
		</div>
	);
}

ChannelMessage.Skeleton = () => {
	return (
		<div>
			<MessageWithUser.Skeleton />
		</div>
	);
};
