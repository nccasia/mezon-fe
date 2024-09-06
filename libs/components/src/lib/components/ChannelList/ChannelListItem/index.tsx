import { selectCountNotifyByChannelId, selectIsUnreadChannelById } from '@mezon/store';
import { ChannelThreads } from '@mezon/utils';
import { Fragment, memo } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import ChannelLink from '../../ChannelLink';
import ModalInvite from '../../ListMemberInvite/modalInvite';
import ThreadListChannel from '../../ThreadListChannel';
import UserListVoiceChannel from '../../UserListVoiceChannel';
import { IChannelLinkPermission } from '../CategorizedChannels';

type ChannelListItemProp = {
	channel: ChannelThreads;
	isActive: boolean;
	permissions: IChannelLinkPermission;
};

const ChannelListItem = (props: ChannelListItemProp) => {
	const { channel, isActive, permissions } = props;
	const isUnReadChannel = useSelector(selectIsUnreadChannelById(channel.id));
	const numberNotification = useSelector(selectCountNotifyByChannelId(channel.id));
	const [openInviteChannelModal, closeInviteChannelModal] = useModal(() => (
		<ModalInvite onClose={closeInviteChannelModal} open={true} channelID={channel.id} />
	));
	const handleOpenInvite = () => {
		openInviteChannelModal();
	};

	return (
		<Fragment>
			<ChannelLink
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
			{channel.threads && <ThreadListChannel threads={channel.threads} />}
			<UserListVoiceChannel channelID={channel.channel_id ?? ''} />
		</Fragment>
	);
};

export default memo(ChannelListItem);
