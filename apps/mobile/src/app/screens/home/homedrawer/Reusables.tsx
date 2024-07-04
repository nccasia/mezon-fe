import React, { useMemo, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { useDMInvite, useDirect, useSendInviteMessage } from '@mezon/core';
import { DirectEntity, UsersClanEntity } from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useEffect } from 'react';
import Images from '../../../../assets/Images';
import { MezonButton } from '../../../temp-ui';
import MezonAvatar from '../../../temp-ui/MezonAvatar';
import { styles } from './styles';


export const ChannelListContext = React.createContext({} as any);
export interface IFriendListItemProps {
	dmGroup?: DirectEntity;
	user?: UsersClanEntity;
	isSent?: boolean;
	onPress: (directParamId?: string, type?: number, userId?: string, dmGroup?: DirectEntity) => void;
}

export interface IListMemberInviteProps {
	urlInvite: string;
	searchTerm: string;
	channelID?: string;
}

export const FastImageRes = React.memo(({ uri, isCirle = false }: { uri: string; isCirle?: boolean }) => {
	return (
		<FastImage
			style={[{ width: '100%', height: '100%' }, isCirle && { borderRadius: 50 }]}
			source={{
				uri: uri,
				headers: { Authorization: 'someAuthToken' },
				priority: FastImage.priority.normal,
			}}
			resizeMode={FastImage.resizeMode.cover}
		/>
	);
});


export const FriendListItem = React.memo((props: IFriendListItemProps) => {
	const { dmGroup, user, isSent, onPress } = props;
	const [isInviteSent, setIsInviteSent] = useState(isSent);

	useEffect(() => {
		setIsInviteSent(isSent);
	}, [isSent]);

	return (
		<View>
			{dmGroup ? (
				<TouchableOpacity
					disabled={isInviteSent}
					onPress={() => {
						onPress(dmGroup.channel_id || '', dmGroup.type || 0, '', dmGroup);
					}}
					style={[styles.friendItemWrapper, isInviteSent && styles.friendItemWrapperInvited]}
				>
					<View style={styles.friendItemContent}>
						{Array.isArray(dmGroup?.channel_avatar) && dmGroup?.channel_avatar?.length > 1 ? (
							<Image source={Images.AVATAR_GROUP} style={{ width: 40, height: 40, borderRadius: 50 }} />
						) : (
							<FastImage
								style={{ width: 40, height: 40, borderRadius: 50 }}
								source={{
									uri: dmGroup.channel_avatar?.at(0),
								}}
								resizeMode={FastImage.resizeMode.cover}
							/>
						)}
						<Text style={styles.friendItemName} numberOfLines={1} ellipsizeMode="tail">
							{dmGroup?.channel_label}
						</Text>
					</View>
					<View>
						<MezonButton
							viewContainerStyle={[styles.inviteButton, isInviteSent && styles.invitedButton]}
							disabled={isInviteSent}
							onPress={() => {
								onPress(dmGroup.channel_id || '', dmGroup.type || 0, '', dmGroup);
							}}
						>
							{isInviteSent ? 'Sent' : 'Invite'}
						</MezonButton>
					</View>
				</TouchableOpacity>
			) : (
				<TouchableOpacity
					disabled={isInviteSent}
					onPress={() => {
						onPress('', 0, user?.id);
					}}
					style={[styles.friendItemWrapper, isInviteSent && styles.friendItemWrapperInvited]}
				>
					<View style={styles.friendItemContent}>
						<MezonAvatar userName={user?.user?.display_name} avatarUrl={user?.user?.avatar_url} />
						<Text style={styles.friendItemName} numberOfLines={1} ellipsizeMode="tail">
							{user?.user?.display_name}
						</Text>
					</View>
					<View>
						<MezonButton
							viewContainerStyle={[styles.inviteButton, isInviteSent && styles.invitedButton]}
							disabled={isInviteSent}
							onPress={() => {
								onPress('', 0, user?.id);
							}}
						>
							{isInviteSent ? 'Sent' : 'Invite'}
						</MezonButton>
					</View>
				</TouchableOpacity>
			)}
		</View>
	);
});

export const ListMemberInvite = React.memo(({ channelID, urlInvite, searchTerm = '' }: IListMemberInviteProps) => {
	const { listDMInvite, listUserInvite } = useDMInvite(channelID);
	const [sendIds, setSendIds] = useState<Record<string, boolean>>({});
	const [linkInvite, setLinkInvite] = useState<string>('');
	const { createDirectMessageWithUser } = useDirect();
	const mezon = useMezon();
	const { sendInviteMessage } = useSendInviteMessage();

	useEffect(() => {
		setLinkInvite(urlInvite);
	}, [urlInvite]);

	const filteredListDMBySearch = useMemo(() => {
		return listDMInvite?.filter((dmGroup) => {
			return dmGroup.channel_label?.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}, [listDMInvite, searchTerm]);

	const filteredListUserBySearch = useMemo(() => {
		return listUserInvite?.filter((dmGroup) => {
			return dmGroup?.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}, [listUserInvite, searchTerm]);

	const sendToDM = async (dataSend: { text: string }, channelSelected: DirectEntity) => {
		await mezon.socketRef.current.writeChatMessage(
			'DM',
			channelSelected.id,
			Number(channelSelected?.user_id?.length) === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP,
			{ t: dataSend.text },
			[],
			[],
			[],
		);
	};

	const directMessageWithUser = async (userId: string) => {
		const response = await createDirectMessageWithUser(userId);
		if (response?.channel_id) {
			var channelMode = 0
			if (Number(response.type) === ChannelType.CHANNEL_TYPE_DM) {
				channelMode = ChannelStreamMode.STREAM_MODE_DM
			}
			if (Number(response.type) === ChannelType.CHANNEL_TYPE_GROUP) {
				channelMode = ChannelStreamMode.STREAM_MODE_GROUP
			}
			sendInviteMessage(linkInvite, response.channel_id, channelMode);
		}
	};

	const handleSendInVite = async (directParamId?: string, type?: number, userId?: string, dmGroup?: DirectEntity) => {
		if (userId) {
			directMessageWithUser(userId);
		}

		if (directParamId && dmGroup) {
			sendToDM({ text: linkInvite }, dmGroup);
		}
		setSendIds((ids) => {
			return {
				...ids,
				[dmGroup?.id]: true,
				[userId]: true,
			};
		});
	};

	return (
		<View>
			{filteredListDMBySearch?.length
				? filteredListDMBySearch?.map((dmGroupItem) => (
					<FriendListItem onPress={handleSendInVite} key={dmGroupItem.id} dmGroup={dmGroupItem} isSent={sendIds[dmGroupItem.id]} />
				))
				: filteredListUserBySearch?.map((user) => (
					<FriendListItem onPress={handleSendInVite} key={user.id} user={user} isSent={sendIds[user.id]} />
				))}
		</View>
	);
});
