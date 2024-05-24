import { DirectMessageBox, DmTopbar, MemberListGroupChat } from '@mezon/components';
import { useAppNavigation, useAppParams, useDirectMessages } from '@mezon/core';
import { RootState, selectDefaultChannelIdByClanId, selectDmGroupCurrent } from '@mezon/store';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ChannelMessages from '../../channel/ChannelMessages';
import { ChannelTyping } from '../../channel/ChannelTyping';

export default function DirectMessage() {
	// TODO: move selector to store
	const isSending = useSelector((state: RootState) => state.messages.isSending);

	const { clanId, directId, type } = useAppParams();
	const defaultChannelId = useSelector(selectDefaultChannelIdByClanId(clanId || ''));
	const { navigate } = useAppNavigation();

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

	return (
		<div className="flex flex-col flex-1 shrink min-w-0 dark:bg-bgSecondary bg-[#F0F0F0] h-[100%]">
			<DmTopbar dmGroupId={directId} />
			<div className="flex flex-row ">
				<div className="flex flex-col flex-1 w-full h-full max-h-messageViewChatDM">
					<div className="overflow-y-auto bg-[#1E1E1E] h-heightMessageViewChatDM flex-shrink" ref={messagesContainerRef}>
						{
							<ChannelMessages
								channelId={directId ?? ''}
								channelLabel={currentDmGroup?.channel_label}
								type={currentDmGroup?.user_id?.length === 1 ? 'DM' : 'GROUP'}
								mode={currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP}
								avatarDM={
									currentDmGroup?.user_id?.length === 1 ? currentDmGroup.channel_avatar?.at(0) : '/assets/images/avatar-group.png'
								}
							/>
						}
					</div>
					<div className="flex-shrink-0 flex flex-col dark:bg-bgPrimary bg-[#F0F0F0] h-auto relative">
						{directId && (
							<ChannelTyping
								channelId={directId}
								channelLabel={''}
								mode={currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP}
							/>
						)}
						<DirectMessageBox
							directParamId={directId ?? ''}
							mode={currentDmGroup?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP}
						/>
					</div>
				</div>
				{Number(type) === ChannelType.CHANNEL_TYPE_GROUP && (
					<div className="w-[268px] bg-bgSurface  lg:flex hidden">
						<MemberListGroupChat directMessageId={directId} />
					</div>
				)}
			</div>
		</div>
	);
}
