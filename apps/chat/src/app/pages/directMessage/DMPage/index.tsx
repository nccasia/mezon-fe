import { DirectMessageBox, DmTopbar, MemberListGroupChat } from '@mezon/components';
import { useAppNavigation, useAppParams, useDirectMessages } from '@mezon/core';
import { RootState, selectDefaultChannelIdByClanId } from '@mezon/store';
import { ChannelTypeEnum } from '@mezon/utils';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ChannelMessages from '../../channel/ChanneMessages';

export function DirectMessage() {
	// TODO: move selector to store
	const isSending = useSelector((state: RootState) => state.messages.isSending);

	const { serverId, directId, type } = useAppParams();
	const defaultChannelId = useSelector(selectDefaultChannelIdByClanId(serverId || ''));
	const { navigate } = useAppNavigation();

	const { messages } = useDirectMessages({ channelId: directId ?? '' });

	const messagesContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (defaultChannelId) {
			navigate(`./${defaultChannelId}`);
		}
	}, [defaultChannelId, navigate]);

	useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, [isSending, [], messages]);

	return (
		<div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%]">
			<DmTopbar dmGroupId={directId} />
			<div className="flex h-heightWithoutTopBar flex-row ">
				<div className="flex flex-col flex-1 w-full h-full ">
					<div className="overflow-y-auto bg-[#1E1E1E]  max-h-heightMessageViewChat h-heightMessageViewChat" ref={messagesContainerRef}>
						{<ChannelMessages channelId={directId ?? ''} />}
					</div>
					<div className="flex-shrink-0 flex flex-col bg-[#1E1E1E] h-auto">
						<DirectMessageBox directParamId={directId ?? ''} />
					</div>
				</div>
				{Number(type) === ChannelTypeEnum.GROUP_CHAT && (
					<div className="w-[268px] bg-bgSurface  lg:flex hidden">
						<MemberListGroupChat directMessageId={directId} />
					</div>
				)}
			</div>
		</div>
	);
}
