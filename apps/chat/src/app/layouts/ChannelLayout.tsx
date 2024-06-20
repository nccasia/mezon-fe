import { GifStickerEmojiPopup } from '@mezon/components';
import { useApp, useChatReaction, useGifsStickersEmoji, useReference, useThreads } from '@mezon/core';
import { selectCloseMenu, selectCurrentChannel, selectReactionTopState, selectStatusMenu } from '@mezon/store';
import { EmojiPlaces, SubPanelName } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

const ChannelLayout = () => {
	const currentChannel = useSelector(selectCurrentChannel);
	const reactionTopState = useSelector(selectReactionTopState);
	const { idMessageRefReaction } = useReference();
	const { subPanelActive } = useGifsStickersEmoji();
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const { isShowCreateThread } = useThreads();
	const { isShowMemberList } = useApp();
	const { positionOfSmileButton, setUserReactionPanelState } = useChatReaction();

	const HEIGHT_EMOJI_PANEL: number = 457;
	const WIDTH_EMOJI_PANEL: number = 500;

	const distanceToBottom = window.innerHeight - positionOfSmileButton.bottom;
	const distanceToRight = window.innerWidth - positionOfSmileButton.right;
	let topPositionEmojiPanel: string;

	if (distanceToBottom < HEIGHT_EMOJI_PANEL) {
		topPositionEmojiPanel = 'auto';
	} else if (positionOfSmileButton.top < 100) {
		topPositionEmojiPanel = `${positionOfSmileButton.top}px`;
	} else {
		topPositionEmojiPanel = `${positionOfSmileButton.top - 100}px`;
	}



	return (
		<div
			className={` flex flex-col
			 flex-1 shrink min-w-0 bg-transparent
			  h-[100%] overflow-visible 
			   
			   ${currentChannel?.type === ChannelType.CHANNEL_TYPE_VOICE ? 'group' : ''}`}
		>
			<div className={`flex flex-row ${closeMenu ? 'h-heightWithoutTopBarMobile' : 'h-heightWithoutTopBar'}`}>
				<Outlet />
			</div>
			{subPanelActive === SubPanelName.EMOJI_REACTION_RIGHT && (
				<div
					id="emojiPicker"
					className={`fixed size-[500px] max-sm:hidden right-1 ${closeMenu && !statusMenu && 'w-[370px]'} ${reactionTopState ? 'top-20' : 'bottom-20'} ${isShowCreateThread && 'ssm:right-[650px]'} ${isShowMemberList && 'ssm:right-[420px]'} ${!isShowCreateThread && !isShowMemberList && 'ssm:right-44'}`}
				>
					<div className="mb-0 z-10 h-full">
						<GifStickerEmojiPopup
							messageEmojiId={idMessageRefReaction}
							mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
							emojiAction={EmojiPlaces.EMOJI_REACTION}
						/>
					</div>
				</div>
			)}
			{subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM && (
				<div
					className="fixed max-sm:hidden"
					style={{
						top: topPositionEmojiPanel,
						bottom: distanceToBottom < HEIGHT_EMOJI_PANEL ? '0' : 'auto',
						left:
							distanceToRight < WIDTH_EMOJI_PANEL
								? `${positionOfSmileButton.left - WIDTH_EMOJI_PANEL}px`
								: `${positionOfSmileButton.right}px`,
					}}
				>
					<div className="mb-0 z-10 h-full">
						<GifStickerEmojiPopup
							messageEmojiId={idMessageRefReaction}
							mode={ChannelStreamMode.STREAM_MODE_CHANNEL}
							emojiAction={EmojiPlaces.EMOJI_REACTION}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChannelLayout;
