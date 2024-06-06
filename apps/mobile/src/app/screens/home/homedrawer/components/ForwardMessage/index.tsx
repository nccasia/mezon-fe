import { useAuth, useChannels, useDirect, useSendForwardMessage } from '@mezon/core';
import { CrossIcon, HashSignIcon, HashSignLockIcon } from '@mezon/mobile-components';
import { Colors, Fonts, size } from '@mezon/mobile-ui';
import { useMezon } from '@mezon/transport';
import { ChannelStatusEnum, IMessageWithUser, removeDuplicatesById } from '@mezon/utils';
import { getSelectedMessage } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { default as CheckBox } from 'react-native-bouncy-checkbox';
import { TextInput } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import { useSelector } from 'react-redux';
import MessageItem from '../../MessageItem';

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
		// console.log(id, type, existingIndex);

		return existingIndex !== -1;
	};

	const sentToMessage = async () => {
		try {
			for (const selectedObjectIdSend of selectedObjectIdSends) {
				if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_DM) {
					mezon.joinChatDirectMessage(selectedObjectIdSend.id, '', selectedObjectIdSend.type);
					sendForwardMessage('', selectedObjectIdSend.id, '', ChannelStreamMode.STREAM_MODE_DM, selectedMessage);
				} else if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_GROUP) {
					mezon.joinChatDirectMessage(selectedObjectIdSend.id, '', selectedObjectIdSend.type);
					sendForwardMessage('', selectedObjectIdSend.id, '', ChannelStreamMode.STREAM_MODE_GROUP, selectedMessage);
				} else if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_TEXT) {
					await mezon.joinChatChannel(selectedObjectIdSend.id);
					sendForwardMessage(
						selectedObjectIdSend.clanId || '',
						selectedObjectIdSend.id,
						selectedObjectIdSend.channel_label || '',
						ChannelStreamMode.STREAM_MODE_CHANNEL,
						selectedMessage,
					);
				}
			}
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
							<Image source={{ uri: item.avatarUser }} style={styles.memberAvatar} />
							<Text style={styles.memberName}>{item.name}</Text>
						</View>

						<View>
							<CheckBox
								isChecked={isChecked(item.idDM, item.typeChat || 0)}
								size={24}
								fillColor={Colors.green}
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
								fillColor={Colors.green}
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

	useEffect(() => {
		// console.log("vvv", message);
	}, [message]);

	return (
		<View>
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

					<View style={styles.inputWrapper}>
						<TextInput
							style={styles.input}
							onChangeText={setSearchText}
							placeholderTextColor={'white'}
							placeholder="Search" />
					</View>

					<ScrollView style={{ marginVertical: 10 }}>
						{!searchText.startsWith('@') && !searchText.startsWith('#') ? (
							<>
								{/*{renderMember()}*/}
								{renderChannel()}
							</>
						) : (
							<>
								{searchText.startsWith('@') && (
									<>
										<Text style={{ color: 'white' }}>Search friend and users</Text>
										{renderMember()}
									</>
								)}

								{searchText.startsWith('#') && (
									<>
										<Text style={{ color: 'white' }}>Searching channel</Text>
										{renderChannel()}
									</>
								)}
							</>
						)}
					</ScrollView>
					{message && <MessageItem message={message} mode={ChannelStreamMode.STREAM_MODE_CHANNEL} />}

					<TouchableOpacity style={styles.btn} onPress={() => sentToMessage()}>
						<Text style={styles.btnText}>Send</Text>
					</TouchableOpacity>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	sheetContainer: {
		overflow: 'hidden',
		padding: 24,
		backgroundColor: Colors.primary,
		alignSelf: 'center',
		borderRadius: 10,
		maxHeight: '70%',
		maxWidth: '90%',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	headerModal: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerText: {
		color: Colors.white,
		fontSize: Fonts.size.medium,
		textAlign: 'center',
		fontWeight: '600',
	},
	btn: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.green,
		paddingVertical: 10,
		borderRadius: 50,
	},
	btnText: {
		color: Colors.white,
	},

	inputWrapper: {
		backgroundColor: Colors.secondary,
		borderRadius: 10,
		paddingHorizontal: 15,
		marginVertical: 20,
	},

	input: {
		color: Colors.white,
		fontSize: Fonts.size.small,
		paddingVertical: 0,
		height: size.s_40,
	},

	item: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},

	memberContent: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 10,
	},
	memberAvatar: {
		height: 36,
		width: 36,
		borderRadius: 50,
	},
	memberName: {
		color: Colors.white,
		fontSize: Fonts.size.small,
	},
	channelItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 10,
	},
	channelName: {
		color: Colors.white,
		fontSize: Fonts.size.small,
	},
});

export default ForwardMessageModal;
