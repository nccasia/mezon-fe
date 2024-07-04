import { ChannelsEntity } from '@mezon/store';

type ThreadModalContentProps = {
	messages: any[];
	thread: ChannelsEntity;
};

const ThreadModalContent = ({ messages, thread }: ThreadModalContentProps) => {
	return (
		<div className="w-full overflow-x-hidden">
			<p className="text-base font-medium text-textThreadPrimary text-ellipsis whitespace-nowrap overflow-x-hidden">
				{(messages[0]?.content?.t as string) ?? (thread.last_sent_message && JSON.parse(thread.last_sent_message.content || '{}').t)}
			</p>
		</div>
	);
};

export default ThreadModalContent;
