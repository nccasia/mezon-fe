import { DirectMessageBox, DmTopbar, FileUploadByDnD, GifStickerEmojiPopup, MemberListGroupChat } from '@mezon/components';
import {
	useApp,
	useAppNavigation,
	useAppParams,
	useChatMessages,
	useChatReaction,
	useDirectMessages,
	useDragAndDrop,
	useGifsStickersEmoji,
	useMenu,
	useReference,
	useThreads,
} from '@mezon/core';
import { RootState, directActions, selectDefaultChannelIdByClanId, selectDmGroupCurrent, selectIsShowMemberListDM, selectIsUseProfileDM, selectReactionTopState, useAppDispatch } from '@mezon/store';
import { EmojiPlaces, SubPanelName } from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { DragEvent, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ChannelMessages from '../../channel/ChannelMessages';
import { ChannelTyping } from '../../channel/ChannelTyping';
import ModalUserProfile from '../../../../../../../libs/components/src/lib/components/ModalUserProfile';

function useChannelSeen(channelId: string) {
	const dispatch = useAppDispatch();
	const { lastMessage } = useChatMessages({ channelId });
		useEffect(() => {
			if (lastMessage) {
				const timestamp = Date.now() / 1000;
				dispatch(directActions.setDirectLastSeenTimestamp({ channelId, timestamp: timestamp }));
				dispatch(directActions.updateLastSeenTime(lastMessage));
			}
		}, [channelId, dispatch, lastMessage]);
}
export default function DirectMessage() {
	// TODO: move selector to store
	const isSending = useSelector((state: RootState) => state.messages.isSending);
	const { clanId, directId, type } = useAppParams();
	const defaultChannelId = useSelector(selectDefaultChannelIdByClanId(clanId || ''));
	const { navigate } = useAppNavigation();
	const { draggingState, setDraggingState } = useDragAndDrop();
	const isShowMemberListDM = useSelector(selectIsShowMemberListDM);
	const isUseProfileDM = useSelector(selectIsUseProfileDM);

	useChannelSeen(directId || '');
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (defaultChannelId) {
			navigate(`./${defaultChannelId}`);
		}
	}, [defaultChannelId, navigate]);

	const currentDmGroup = useSelector(selectDmGroupCurrent(directId ?? ''));

	const { messages } = useDirectMessages({
		channelId: directId ?? '',
		mode: currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP,
	});

	useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, [isSending, [], messages]);

	const reactionTopState = useSelector(selectReactionTopState);
	const { idMessageRefReaction } = useReference();
	const { subPanelActive } = useGifsStickersEmoji();
	const { closeMenu, statusMenu } = useMenu();
	const { isShowCreateThread } = useThreads();
	const { isShowMemberList } = useApp();
	const { positionOfSmileButton } = useChatReaction();

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
	const handleDragEnter = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer?.types.includes('Files')) {
			setDraggingState(true);
		}
	};
	return (
		<>
			{draggingState && <FileUploadByDnD currentId={currentDmGroup.channel_id ?? ''} />}
			<div
				className={` flex flex-col
			 flex-1 shrink min-w-0 bg-transparent
			  h-[100%] overflow-visible`}
				onDragEnter={handleDragEnter}
			>
				{' '}
				<DmTopbar dmGroupId={directId} />
				<div className="flex flex-row ">
					<div className="flex flex-col flex-1 w-full h-full max-h-messageViewChatDM">
						<div className="overflow-y-auto bg-[#1E1E1E] h-heightMessageViewChatDM flex-shrink" ref={messagesContainerRef}>
							{
								<ChannelMessages
									channelId={directId ?? ''}
									channelLabel={currentDmGroup?.channel_label}
									type={currentDmGroup?.user_id?.length === 1 ? 'DM' : 'GROUP'}
									mode={
										currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP
									}
									avatarDM={
										currentDmGroup?.user_id?.length === 1
											? currentDmGroup.channel_avatar?.at(0)
											: 'assets/images/avatar-group.png'
									}
								/>
							}
						</div>

						{subPanelActive === SubPanelName.EMOJI_REACTION_RIGHT && (
							<div
								id="emojiPicker"
								className={`fixed size-[500px] max-sm:hidden right-1 ${closeMenu && !statusMenu && 'w-[370px]'} ${reactionTopState ? 'top-20' : 'bottom-20'} ${isShowCreateThread && 'ssm:right-[650px]'} ${isShowMemberList && 'ssm:right-[420px]'} ${!isShowCreateThread && !isShowMemberList && 'ssm:right-44'}`}
							>
								<div className="mb-0 z-10 h-full">
									<GifStickerEmojiPopup
										messageEmojiId={idMessageRefReaction}
										mode={
											currentDmGroup?.user_id?.length === 1
												? ChannelStreamMode.STREAM_MODE_DM
												: ChannelStreamMode.STREAM_MODE_GROUP
										}
										emojiAction={EmojiPlaces.EMOJI_REACTION}
									/>
								</div>
							</div>
						)}
						{subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM && (
							<div
								className="fixed max-sm:hidden z-10"
								style={{
									top: topPositionEmojiPanel,
									bottom: distanceToBottom < HEIGHT_EMOJI_PANEL ? '0' : 'auto',
									left:
										distanceToRight < WIDTH_EMOJI_PANEL
											? `${positionOfSmileButton.left - WIDTH_EMOJI_PANEL}px`
											: `${positionOfSmileButton.right}px`,
								}}
							>
								<div className="mb-0 z-50 h-full ">
									<GifStickerEmojiPopup
										messageEmojiId={idMessageRefReaction}
										mode={
											currentDmGroup?.user_id?.length === 1
												? ChannelStreamMode.STREAM_MODE_DM
												: ChannelStreamMode.STREAM_MODE_GROUP
										}
										emojiAction={EmojiPlaces.EMOJI_REACTION}
									/>
								</div>
							</div>
						)}

						<div className="flex-shrink-0 flex flex-col z-0 dark:bg-bgPrimary bg-bgLightPrimary h-auto relative">
							{directId && (
								<ChannelTyping
									channelId={directId}
									channelLabel={''}
									mode={
										currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP
									}
								/>
							)}
							<DirectMessageBox
								directParamId={directId ?? ''}
								mode={currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP}
							/>
						</div>
					</div>
					{Number(type) === ChannelType.CHANNEL_TYPE_GROUP && (
						<div className={`w-[241px] dark:bg-bgSecondary bg-bgLightSecondary ${isShowMemberListDM ? 'flex' : 'hidden'}`}>
							<MemberListGroupChat directMessageId={directId} />
						</div>
					)}
					{Number(type) === ChannelType.CHANNEL_TYPE_DM && (
						<div className={`w-[340px] dark:bg-bgSecondary bg-bgLightSecondary ${isUseProfileDM ? 'flex' : 'hidden'}`}>
							<ModalUserProfile 
								userID = {Array.isArray(currentDmGroup?.user_id) ? currentDmGroup?.user_id[0] : currentDmGroup?.user_id} 
								classWrapper='w-full' 
								classBanner='h-[120px]' 
								hiddenRole={true}
								showNote={true}
							/>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
