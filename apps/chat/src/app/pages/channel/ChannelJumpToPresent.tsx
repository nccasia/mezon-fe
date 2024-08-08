import { messagesActions, useAppDispatch } from "@mezon/store";
import { useCallback } from "react";

type ChannelTypingProps = {
	channelId: string;
	mode: number;
};

export function ChannelJumpToPresent({ channelId, mode }: ChannelTypingProps) {
	const dispatch = useAppDispatch();

	const handleJumpToPresent = useCallback(() => {
		// Jump to present
		dispatch(messagesActions.fetchMessages({ channelId, isFetchingLatestMessages: true, noCache: true }));
		dispatch(messagesActions.setIdMessageToJump(null));
	}, [channelId, dispatch]);

	return <div className="left-4 pl-4 cursor-pointer dark:bg-bgPrimary" onClick={handleJumpToPresent}>Viewing older messages      (Click to jump to present)</div>;
}
