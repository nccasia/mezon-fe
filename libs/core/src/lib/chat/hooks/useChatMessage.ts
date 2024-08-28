import { IMessage } from '@mezon/utils';
import { useSeenMessagePool } from './useSeenMessagePool';

export function useChatMessage(messageId: string) {
	const { markMessageAsSeen: doMarkMessageAsSeen } = useSeenMessagePool();

	const markMessageAsSeen = (message: IMessage) => {
		doMarkMessageAsSeen(message);
	};

	return {
		markMessageAsSeen
	};
}
