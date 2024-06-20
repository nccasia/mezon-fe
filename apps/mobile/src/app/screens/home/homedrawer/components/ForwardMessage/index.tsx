import { useAuth, useChannels, useDirect, useSendForwardMessage } from '@mezon/core';
import { CheckIcon, CrossIcon, HashSignIcon, HashSignLockIcon, UserGroupIcon } from '@mezon/mobile-components';
import { Colors } from '@mezon/mobile-ui';
import { useMezon } from '@mezon/transport';
import { ChannelStatusEnum, IMessageWithUser, removeDuplicatesById } from '@mezon/utils';
import { getSelectedMessage } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { default as CheckBox } from 'react-native-bouncy-checkbox';
import { TextInput } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import { useSelector } from 'react-redux';
import MessageItem from '../../MessageItem';
import { styles } from './styles';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

type OpjectSend = {
	id: string;
	type: number;
	clanId?: string;
	channel_label?: string;
};

interface ForwardMessageModalProps {
	show?: boolean;
	onClose: () => void;
	message: IMessageWithUser;
}

const ForwardMessageModal = ({ show, onClose, message }: ForwardMessageModalProps) => {
	const [searchText, setSearchText] = useState('');
	const [selectedObjectIdSends, setSelectedObjectIdSends] = useState<OpjectSend[]>([]);
	const { listDM: dmGroupChatList } = useDirect();
	const { listChannels } = useChannels();
	const { userProfile } = useAuth();
	const { sendForwardMessage } = useSendForwardMessage();
	const mezon = useMezon();
	const selectedMessage = useSelector(getSelectedMessage);
	const listDM = dmGroupChatList.filter((groupChat) => groupChat.type === 3);
	const listGroup = dmGroupChatList.filter((groupChat) => groupChat.type === 2);
	const accountId = userProfile?.user?.id ?? '';
	const { t } = useTranslation('message');

	const listMemSearch = useMemo(() => {
		const listDMSearch = listDM.length
			? listDM.map((itemDM: any) => {
				return {
					id: itemDM?.user_id[0] ?? '',
					name: itemDM?.channel_label ?? '',
					avatarUser: itemDM?.channel_avatar[0] ?? '',
					idDM: itemDM?.id ?? '',
					typeChat: 3,
				};
			})
			: [];
		const listGroupSearch = listGroup.length
			? listGroup.map((itemGr: any) => {
				return {
					id: itemGr?.channel_id ?? '',
					name: itemGr?.channel_label ?? '',
					avatarUser: 'assets/images/avatar-group.png' ?? '',
					idDM: itemGr?.id ?? '',
					typeChat: 2,
				};
			})
			: [];

		const listSearch = [...listDMSearch, ...listGroupSearch];

		return removeDuplicatesById(listSearch.filter((item) => item.id !== accountId));
	}, [accountId, listDM, listGroup]);

	const listChannelSearch = useMemo(() => {
		const list = listChannels.map((item) => {
			return {
				id: item?.id ?? '',
				name: item?.channel_label ?? '',
				subText: item?.category_name ?? '',
				icon: '#',
				type: item?.type ?? '',
				clanId: item?.clan_id ?? '',
				channel_label: item?.channel_label ?? '',
			};
		});
		return list;
	}, [listChannels]);

	const handleToggle = (id: string, type: number, clanId?: string, channel_label?: string) => {
		const existingIndex = selectedObjectIdSends.findIndex((item) => item.id === id && item.type === type);
		if (existingIndex !== -1) {
			setSelectedObjectIdSends((prevItems) => [...prevItems.slice(0, existingIndex), ...prevItems.slice(existingIndex + 1)]);
		} else {
			setSelectedObjectIdSends((prevItems) => [...prevItems, { id, type, clanId, channel_label }]);
		}
	};

	const isChecked = (id: string, type: number) => {
		const existingIndex = selectedObjectIdSends.findIndex((item) => item.id === id && item.type === type);
		return existingIndex !== -1;
	};

	const sentToMessage = async () => {
		try {
			for (const selectedObjectIdSend of selectedObjectIdSends) {
				if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_DM) {
					sendForwardMessage('', selectedObjectIdSend.id, '', ChannelStreamMode.STREAM_MODE_DM, selectedMessage);
				} else if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_GROUP) {
					sendForwardMessage('', selectedObjectIdSend.id, '', ChannelStreamMode.STREAM_MODE_GROUP, selectedMessage);
				} else if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_TEXT) {
					sendForwardMessage(
						selectedObjectIdSend.clanId || '',
						selectedObjectIdSend.id,
						selectedObjectIdSend.channel_label || '',
						ChannelStreamMode.STREAM_MODE_CHANNEL,
						selectedMessage,
					);
				}
			}
			Toast.show({
				type: 'success',
				props: {
					text2: t('forwardMessagesSuccessfully'),
					leadingIcon: <CheckIcon color={Colors.green} width={30} height={17} />
				}
			});
		} catch (error) {
			console.log('Tom log  => error', error);
		}

		onClose && onClose();
	};

	const renderMember = () => {
		return listMemSearch
			.filter((item: any) => item.name?.toLowerCase()?.indexOf(searchText?.toLowerCase().substring(1)) > -1)
			.slice(0, 25)
			.map((item: any, index: number) => {
				return (
					<View style={styles.item} key={index.toString()}>
						<View style={styles.memberContent} key={index.toString()}>
							{item?.typeChat === 2 ? (
								<View style={styles.groupAvatar}>
									<UserGroupIcon />
								</View>
							): (
								<Image source={{ uri: item.avatarUser }} style={styles.memberAvatar} />
							)}
							<Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
						</View>

						<View>
							<CheckBox
								isChecked={isChecked(item.idDM, item.typeChat || 0)}
								size={24}
								fillColor={Colors.textViolet}
								unFillColor={Colors.bgGrayLight}
								innerIconStyle={{ borderWidth: 2 }}
								onPress={() => {
									handleToggle(item.idDM, item.typeChat || 0);
								}}
							/>
						</View>
					</View>
				);
			});
	};

	const renderChannel = () => {
		return listChannelSearch
			.filter((item) => item.name?.toLowerCase().indexOf(searchText?.toLowerCase()?.substring(1)) > -1)
			.slice(0, 25)
			.map((channel: any, index: number) => {
				return (
					<View style={styles.item} key={index.toString()}>
						<View style={styles.channelItem}>
							{channel.channel_private === ChannelStatusEnum.isPrivate ? (
								<HashSignLockIcon height={24} width={24} />
							) : (
								<HashSignIcon height={24} width={24} />
							)}
							<Text style={styles.channelName}>{channel.name}</Text>
						</View>

						<View>
							<CheckBox
								isChecked={isChecked(channel.id, channel.type || 0)}
								size={24}
								fillColor={Colors.textViolet}
								unFillColor={Colors.bgGrayLight}
								innerIconStyle={{ borderWidth: 2 }}
								onPress={() => {
									handleToggle(channel.id, channel.type || 0, channel.clanId, channel.channel_label || '');
								}}
							/>
						</View>
					</View>
				);
			});
	};

	return (
		<Modal
			isVisible={show}
			animationIn={'fadeIn'}
			hasBackdrop={true}
			coverScreen={true}
			avoidKeyboard={false}
			onBackdropPress={onClose}
			backdropColor={'rgba(0,0,0, 0.7)'}
		>
			<View style={styles.sheetContainer}>
				<View style={styles.headerModal}>
					<TouchableOpacity onPress={onClose}>
						<CrossIcon height={16} width={16} />
					</TouchableOpacity>
					<Text style={styles.headerText}>Forward Message</Text>
					<View style={{ width: 16 }}></View>
				</View>

				<View style={styles.searchWrapper}>
					<View style={styles.inputWrapper}>
						<TextInput
							style={styles.input}
							onChangeText={setSearchText}
							placeholderTextColor={'white'}
							placeholder="Search"
						/>
					</View>
				</View>

				<ScrollView>
					{!searchText.startsWith('@') && !searchText.startsWith('#') ? (
						<>
							{renderMember()}
							{renderChannel()}
						</>
					) : (
						<>
							{searchText.startsWith('@') && (
								<>
									<Text style={styles.typeSearch}>Search friend and users</Text>
									{renderMember()}
								</>
							)}

							{searchText.startsWith('#') && (
								<>
									<Text style={styles.typeSearch}>Searching channel</Text>
									{renderChannel()}
								</>
							)}
						</>
					)}
				</ScrollView>
				<View style={styles.messageWrapper}>
					<ScrollView>
						{message && <MessageItem message={message} mode={ChannelStreamMode.STREAM_MODE_CHANNEL} />}
					</ScrollView>
				</View>
				<TouchableOpacity style={styles.btn} onPress={() => sentToMessage()}>
					<Text style={styles.btnText}>Send</Text>
				</TouchableOpacity>
			</View>
		</Modal>
	);
};

export default ForwardMessageModal;
