import {
	selectArrayUnreadChannel,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectEntitiesChannel,
	selectMemberStatus,
	selectMembersByChannelId,
} from '@mezon/store';
import { IChannel } from '@mezon/utils';
import { useMemo } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import ChannelLink from '../../ChannelLink';
import ModalInvite from '../../ListMemberInvite/modalInvite';
type ChannelListItemProp = {
	channel: IChannel;
};
const ChannelListItem = (props: ChannelListItemProp) => {
	const currentChanel = useSelector(selectCurrentChannel);
	const arrayUnreadChannel = useSelector(selectArrayUnreadChannel);
	const entitiesChannel = useSelector(selectEntitiesChannel);
	const { channel } = props;
	const [openInviteChannelModal, closeInviteChannelModal] = useModal(() => (
		<ModalInvite onClose={closeInviteChannelModal} open={true} channelID={channel.id} />
	));
	const handleOpenInvite = () => {
		openInviteChannelModal();
	};

	const currentChannelId = useSelector(selectCurrentChannelId);
	const rawMembers = useSelector(selectMembersByChannelId(currentChannelId));
	const onlineStatus = useSelector(selectMemberStatus);

	const onlineMembers = useMemo(() => {
		if (!rawMembers) return [];
		return rawMembers.filter((user) => user.user?.online === true);
	}, [onlineStatus, rawMembers]);

	console.log(onlineMembers);
	// const { voiceChannelMemberList, setVoiceChannelMemberList } = useContext(ChatContext);
	// const convertMemberToVoiceData = () => {
	// 	const newArray: any = [];
	// 	for (const item of onlineMembers) {
	// 		const newItem: any = {
	// 			clanId: '',
	// 			clanName: '',
	// 			id: '',
	// 			lastScreenshot: '',
	// 			participant: item.user?.username,
	// 			userId: item.user?.id,
	// 			voiceChannelId: item.channelId,
	// 			voiceChannelLabel: '',
	// 		};
	// 		newArray.push(newItem);
	// 	}
	// 	setVoiceChannelMemberList(newArray);
	// };
	// useEffect(() => {
	// 	convertMemberToVoiceData();
	// }, [currentChanel?.channel_id]);

	const isUnReadChannel = (channelId: string) => {
		const channel = arrayUnreadChannel.find((item) => item.channelId === channelId);
		const checkTypeChannel = entitiesChannel[channelId];
		if (checkTypeChannel && checkTypeChannel.type === 4) {
			return true;
		} else {
			if (channel && channel.channelLastMessageId === channel.channelLastSeenMesageId) {
				return true;
			}
		}

		return false;
	};
	return (
		<ChannelLink
			clanId={channel?.clan_id}
			channel={channel}
			active={currentChanel?.id === channel.id}
			key={channel.id}
			createInviteLink={handleOpenInvite}
			isPrivate={channel.channel_private}
			isUnReadChannel={isUnReadChannel(channel.id)}
		/>
	);
};

export default ChannelListItem;
