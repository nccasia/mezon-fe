// Last seen message update mechanism
// Every time message component is rendered
// component triggers updateLastSeenMessage action
// action contains channelId, messageId, message create time
// push action into cache, keep the payload with the latest create time
// set timeout to 1 second, if no new action comes in, send the latest action to clan

import { messagesActions, seenMessagePool, useAppDispatch } from '@mezon/store';
import { IMessage } from '@mezon/utils';

export function useSeenMessagePool() {
	const dispatch = useAppDispatch();

	const initWorker = () => {
		seenMessagePool.registerSeenMessageWorker((action) => {
			dispatch(				
				messagesActions.updateLastSeenMessage({
					channelId: action.channelId,
					channelLabel: action.channelLabel,
					messageId: action.messageId,
				}),
			);
		});
	};

	const unInitWorker = () => {
		seenMessagePool.unRegisterSeenMessageWorker();
	};

	const markMessageAsSeen = (message: IMessage) => {
		seenMessagePool.addSeenMessage({
			channelId: message.channel_id || '',
			channelLabel: message.channel_label,
			messageId: message.id || '',
			messageCreatedAt: message.creationTimeMs ? +message.creationTimeMs : 0,
			messageSeenAt: +Date.now(),
		});
	};

	return {
		markMessageAsSeen,
		initWorker,
		unInitWorker,
	};
}
