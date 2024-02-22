import { useChannelMembers } from './useChannelMembers';

export type useMessagesOptions = {
	channelId: string;
};

export function useChatMembers({ channelId }: useMessagesOptions) {
	const { members } = useChannelMembers({ channelId });

	return {
		members,
	};
}
