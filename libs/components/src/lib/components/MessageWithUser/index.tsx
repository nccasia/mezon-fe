import {
	IChannelMember,
	IMessageWithUser
} from '@mezon/utils';
import Skeleton from 'react-loading-skeleton';
import MessageAvatar from './MessageAvatar';
import { useMessageParser } from './useMessageParser';
import MessageHead from './MessageHead';
import MessageContent from './MessageContent';
import MessageTime from './MessageTime';
import { useMessageSender } from './useMessageSender';
import MessageStatus from './MessageStatus';

export type MessageWithUserProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	user?: IChannelMember | null;
};

function MessageWithUser({ message, preMessage, user }: MessageWithUserProps) {

	const parsedMessage = useMessageParser(message, preMessage);
	const parsedSender = useMessageSender(user);
	
	const { isCombine } = parsedMessage;

	return (
		<>
			<MessageTime parsedMessage={parsedMessage} />

			<div
				className={`flex py-0.5 h-15 group hover:bg-gray-950/[.07] overflow-x-hidden cursor-pointer relative ml-4 w-auto mr-4 ${isCombine ? '' : 'mt-3'}`}
			>
				<div className="justify-start gap-4 inline-flex w-full relative">
					<MessageAvatar sender={parsedSender} parsedMessage={parsedMessage} />
					<div className="flex-col w-full flex justify-center items-start relative gap-1">
						<MessageHead sender={parsedSender} parsedMessage={parsedMessage}  />
						<div className="justify-start items-center inline-flex w-full">
							<div className="flex flex-col gap-1 text-[#CCCCCC] font-['Manrope'] whitespace-pre-wrap text-[15px] w-widthMessageTextChat">
								<MessageContent sender={parsedSender} parsedMessage={parsedMessage}  />
							</div>
						</div>
					</div>
				</div>
				<MessageStatus sender={parsedSender} parsedMessage={parsedMessage} />
			</div>
		</>
	);
}

MessageWithUser.Skeleton = () => {
	return (
		<div className="flex py-0.5 min-w-min mx-3 h-15 mt-3 hover:bg-gray-950/[.07] overflow-x-hidden cursor-pointer  flex-shrink-1">
			<Skeleton circle={true} width={38} height={38} />
		</div>
	);
};

export default MessageWithUser;
