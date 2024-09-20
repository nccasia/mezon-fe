import { selectCountNotifyByChannelId, selectIsUnreadChannelById } from '@mezon/store';
import { ChannelThreads } from '@mezon/utils';
import React, { Fragment, memo, useImperativeHandle, useRef } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import ChannelLink, { ChannelLinkRef } from '../../ChannelLink';
import ModalInvite from '../../ListMemberInvite/modalInvite';
import ThreadListChannel, { ListThreadChannelRef } from '../../ThreadListChannel';
import UserListVoiceChannel from '../../UserListVoiceChannel';
import { IChannelLinkPermission } from '../CategorizedChannels';

type ChannelListItemProp = {
	channel: ChannelThreads;
	isActive: boolean;
	permissions: IChannelLinkPermission;
};

export type ChannelListItemRef = {
	scrollIntoChannel: (options?: ScrollIntoViewOptions) => void;
	scrollIntoThread: (threadId: string, options?: ScrollIntoViewOptions) => void;
};

const ChannelListItem = React.forwardRef<ChannelListItemRef | null, ChannelListItemProp>((props: ChannelListItemProp, ref) => {
	const { channel, isActive, permissions } = props;
	const isUnReadChannel = useSelector(selectIsUnreadChannelById(channel.id));
	const numberNotification = useSelector(selectCountNotifyByChannelId(channel.id));
	const [openInviteChannelModal, closeInviteChannelModal] = useModal(() => (
		<ModalInvite onClose={closeInviteChannelModal} open={true} channelID={channel.id} />
	));
	const handleOpenInvite = () => {
		openInviteChannelModal();
	};

	const listThreadRef = useRef<ListThreadChannelRef | null>(null);
	const channelLinkRef = useRef<ChannelLinkRef | null>(null);

	useImperativeHandle(ref, () => {
		return {
			scrollIntoChannel: (options: ScrollIntoViewOptions = { block: 'center' }) => {
				channelLinkRef.current?.scrollIntoView(options);
			},
			scrollIntoThread: (threadId: string, options: ScrollIntoViewOptions = { block: 'center' }) => {
				listThreadRef.current?.scrollIntoThread(threadId, options);
			}
		};
	});

	return (
		<Fragment>
			<ChannelLink
				ref={channelLinkRef}
				clanId={channel?.clan_id}
				channel={channel}
				key={channel.id}
				createInviteLink={handleOpenInvite}
				isPrivate={channel.channel_private}
				isUnReadChannel={isUnReadChannel}
				numberNotification={numberNotification}
				channelType={channel?.type}
				isActive={isActive}
				permissions={permissions}
			/>
			{channel.threads && <ThreadListChannel ref={listThreadRef} threads={channel.threads} />}
			<UserListVoiceChannel channelID={channel.channel_id ?? ''} channelType={channel?.type} />
		</Fragment>
	);
});

export default memo(ChannelListItem);
