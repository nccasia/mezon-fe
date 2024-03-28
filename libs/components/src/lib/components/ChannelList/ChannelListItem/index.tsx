import { selectArrayNotification, selectArrayUnreadChannel, selectCurrentChannel, selectEntitiesChannel } from '@mezon/store';
import { IChannel, NotificationContent } from '@mezon/utils';
import { Fragment } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import { ChannelType } from 'vendors/mezon-js/packages/mezon-js/dist';
import ChannelLink from '../../ChannelLink';
import ModalInvite from '../../ListMemberInvite/modalInvite';
import UserListVoiceChannel from '../../UserListVoiceChannel';
type ChannelListItemProp = {
	channel: IChannel;
};
const ChannelListItem = (props: ChannelListItemProp) => {
	const currentChanel = useSelector(selectCurrentChannel);
	const arrayUnreadChannel = useSelector(selectArrayUnreadChannel);
	const entitiesChannel = useSelector(selectEntitiesChannel);
	const arrayNotication = useSelector(selectArrayNotification);
	const { channel } = props;

	const [openInviteChannelModal, closeInviteChannelModal] = useModal(() => (
		<ModalInvite onClose={closeInviteChannelModal} open={true} channelID={channel.id} />
	));
	const handleOpenInvite = () => {
		openInviteChannelModal();
	};

	const isUnReadChannel = (channelId: string) => {
		const channel = arrayUnreadChannel.find((item) => item.channelId === channelId);
		const checkTypeChannel = entitiesChannel[channelId];
		if (checkTypeChannel && checkTypeChannel.type === 4) {
			return true;
		} else {
			if (channel && channel.channelLastSentMessageId === channel.channelLastSeenMesageId) {
				return true;
			}
		}

		return false;
	};

	const isNotication = (channelId: string) => {
		let count = 0;
		const channel = arrayUnreadChannel.find((item) => item.channelId === channelId);
		arrayNotication.map((item) => {
			const nocation = item.content as NotificationContent;
			if (nocation.channel_id === channelId) {
				const timestamp = nocation.update_time?.seconds;
				if (!!timestamp && timestamp > Number(channel?.timestamp)) {
					count++;
				}
			}
		});

		return count;
	};

	return (
		<Fragment>
			<ChannelLink
				clanId={channel?.clan_id}
				channel={channel}
				active={currentChanel?.id === channel.id}
				key={channel.id}
				createInviteLink={handleOpenInvite}
				isPrivate={channel.channel_private}
				isUnReadChannel={isUnReadChannel(channel.id)}
				numberNotication={isNotication(channel.id)}
			/>
			<UserListVoiceChannel channelID={channel.channel_id ?? ""}  />
		</Fragment>
	);
};

export default ChannelListItem;
