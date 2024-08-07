import { useChannels, useSendForwardMessage } from '@mezon/core';
import { CheckIcon, Icons, UserGroupIcon } from '@mezon/mobile-components';
import { Block, Colors, size, Text, useTheme } from '@mezon/mobile-ui';
import { DirectEntity, selectDirectsOpenlist } from '@mezon/store-mobile';
import { ChannelThreads, IMessageWithUser } from '@mezon/utils';
import { SeparatorWithLine } from 'apps/mobile/src/app/components/Common';
import { MezonInput } from 'apps/mobile/src/app/temp-ui';
import { normalizeString } from 'apps/mobile/src/app/utils/helpers';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, TouchableOpacity, View } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { styles } from './styles';

interface IForwardIObject {
	channelId: string;
	type: number;
	clanId?: string;
	name?: string;
	avatar?: string;
}

interface ForwardMessageModalProps {
	show?: boolean;
	onClose: () => void;
	message: IMessageWithUser;
}

const ForwardMessageModal = ({ show, message, onClose }: ForwardMessageModalProps) => {
	const [searchText, setSearchText] = useState('');
	const [selectedForwardObjects, setSelectedForwardObjects] = useState<IForwardIObject[]>([]);

	const dmGroupChatList = useSelector(selectDirectsOpenlist);
	const { listChannels } = useChannels();

	const { sendForwardMessage } = useSendForwardMessage();
	const { t } = useTranslation('message');
	const { themeValue } = useTheme();

	const mapDirectMessageToForwardObject = (dm: DirectEntity): IForwardIObject => {
		return {
			channelId: dm?.id,
			type: dm?.type,
			avatar: dm?.type === ChannelType.CHANNEL_TYPE_DM ? dm?.channel_avatar?.[0] : 'assets/images/avatar-group.png',
			name: dm?.channel_label,
			clanId: ''
		}
	}

	const mapChannelToForwardObject = (channel: ChannelThreads): IForwardIObject => {
		return {
			channelId: channel?.id,
			type: channel?.type,
			avatar: '#',
			name: channel?.channel_label,
			clanId: channel?.clan_id
		}
	}

	const allForwardObject = useMemo(() => {
		const listDMForward = dmGroupChatList?.filter(dm => dm?.type === ChannelType.CHANNEL_TYPE_DM && dm?.channel_label)
			.map(mapDirectMessageToForwardObject);

		const listGroupForward = dmGroupChatList?.filter(groupChat => groupChat?.type === ChannelType.CHANNEL_TYPE_GROUP && groupChat?.channel_label)
			.map(mapDirectMessageToForwardObject);

		const listTextChannel = listChannels?.filter(channel => channel?.type === ChannelType.CHANNEL_TYPE_TEXT && channel?.channel_label)
			.map(mapChannelToForwardObject);

		return [...listDMForward, ...listGroupForward, ...listTextChannel]
	}, [dmGroupChatList, listChannels])

	const filteredForwardObjects = useMemo(() => {
		return allForwardObject.filter(ob => normalizeString(ob?.name).includes(normalizeString(searchText)));
	}, [searchText, allForwardObject])

	const isChecked = (forwardObject: IForwardIObject) => {
		const { channelId, type } = forwardObject;
		const existingIndex = selectedForwardObjects.findIndex((item) => item.channelId === channelId && item.type === type);
		return existingIndex !== -1;
	};

	const sentToMessage = async () => {
		if (!selectedForwardObjects.length) return;
		try {
			for (const selectedObjectSend of selectedForwardObjects) {
				const { type, channelId, clanId = '' } = selectedObjectSend;
				switch (type) {
					case ChannelType.CHANNEL_TYPE_DM:
						sendForwardMessage('', channelId, ChannelStreamMode.STREAM_MODE_DM, message);
						break;
					case ChannelType.CHANNEL_TYPE_GROUP:
						sendForwardMessage('', channelId, ChannelStreamMode.STREAM_MODE_GROUP, message);
						break;
					case ChannelType.CHANNEL_TYPE_TEXT:
						sendForwardMessage(clanId, channelId, ChannelStreamMode.STREAM_MODE_CHANNEL, message);
						break;
					default:
						break;
				}
			}
			Toast.show({
				type: 'success',
				props: {
					text2: t('forwardMessagesSuccessfully'),
					leadingIcon: <CheckIcon color={Colors.green} width={30} height={17} />,
				},
			});
		} catch (error) {
			console.log('Tom log  => error', error);
		}
		onClose && onClose();
	};

	const onSelectChange = (value: boolean, item: IForwardIObject) => {
		if (value) {
			setSelectedForwardObjects(prevValue => [...prevValue, item])
			return;
		}
		const newValue = selectedForwardObjects.filter(ob => ob.channelId !== item.channelId)
		setSelectedForwardObjects(newValue);
	}

	const renderAvatar = (item: IForwardIObject) => {
		const { type } = item;
		switch (type) {
			case ChannelType.CHANNEL_TYPE_DM:
				if (item?.avatar) {
					return (
						<Image source={{ uri: item?.avatar || '' }} style={styles.memberAvatar} />
					)
				}
				return (
					<Block height={size.s_34} width={size.s_34} justifyContent='center' borderRadius={50} backgroundColor={themeValue.colorAvatarDefault}>
						<Text center>{item?.name?.charAt(0)?.toUpperCase()}</Text>
					</Block>
				)
			case ChannelType.CHANNEL_TYPE_GROUP:
				return (
					<View style={styles.groupAvatar}>
						<UserGroupIcon />
					</View>
				)
			case ChannelType.CHANNEL_TYPE_TEXT:
				return (
					<Block width={size.s_34} height={size.s_34}>
						<Text center h2 color={themeValue.white}>#</Text>
					</Block>
				)
			default:
				break;
		}
	}

	const renderForwardObject = ({ item }: { item: IForwardIObject }) => {
		return (
			<TouchableOpacity onPress={() => onSelectChange(!isChecked(item), item)}>
				<Block flexDirection='row' padding={size.s_10} gap={size.s_6} justifyContent='center'>
					<Block>
						{renderAvatar(item)}
					</Block>
					<Block flex={1} justifyContent='center'>
						<Text color={themeValue.textStrong} numberOfLines={1}>{item.name}</Text>
					</Block>
					<Block justifyContent='center'>
						<BouncyCheckbox
							size={20}
							isChecked={isChecked(item)}
							onPress={(value) => onSelectChange(value, item)}
							fillColor={Colors.bgButton}
							iconStyle={{ borderRadius: 5 }}
							innerIconStyle={{
								borderWidth: 1.5,
								borderColor: isChecked ? Colors.bgButton : Colors.white,
								borderRadius: 5,
								opacity: 1,
							}}
							textStyle={{ fontFamily: 'JosefinSans-Regular' }}
						/>
					</Block>
				</Block>
			</TouchableOpacity>
		)
	}

	const count = useMemo(() => {
		if (selectedForwardObjects.length) return ` (${selectedForwardObjects.length})`
	}, [selectedForwardObjects])

	return (
		<Modal
			isVisible={show}
			hasBackdrop={false}
			style={{ margin: 0, backgroundColor: themeValue.secondary, paddingHorizontal: size.s_16 }}
		>
			<Block flex={1}>
				<Block flexDirection='row' justifyContent='center' marginBottom={size.s_18}>
					<Block position='absolute' left={0}>
						<TouchableOpacity onPress={() => onClose()}>
							<Icons.CloseLargeIcon color={themeValue.textStrong} />
						</TouchableOpacity>
					</Block>
					<Text h3 color={themeValue.white}>{'Forward To'}</Text>
				</Block>

				<MezonInput
					placeHolder={'Search'}
					onTextChange={setSearchText}
					value={searchText}
					prefixIcon={<Icons.MagnifyingIcon color={themeValue.text} height={20} width={20} />}
					inputWrapperStyle={{ backgroundColor: themeValue.primary }}
				/>

				<Block flex={1}>
					<FlatList
						keyboardShouldPersistTaps="handled"
						data={filteredForwardObjects}
						ItemSeparatorComponent={() => <SeparatorWithLine style={{ backgroundColor: themeValue.border }} />}
						keyExtractor={(item) => item?.channelId?.toString()}
						renderItem={renderForwardObject}
					/>
				</Block>

				<Block paddingTop={size.s_10}>
					<TouchableOpacity style={[styles.btn, !selectedForwardObjects.length && { backgroundColor: themeValue.charcoal }]} onPress={() => sentToMessage()}>
						<Text style={styles.btnText}>{'Send'}{count}</Text>
					</TouchableOpacity>
				</Block>
			</Block>
		</Modal>
	);
};

export default ForwardMessageModal;
