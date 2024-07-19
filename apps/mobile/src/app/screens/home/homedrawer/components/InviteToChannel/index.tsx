import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useDMInvite, useDirect, useInvite, useSendInviteMessage } from '@mezon/core';
import { Icons, LinkIcon } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { DirectEntity, selectCurrentChannelId, selectCurrentClan, selectCurrentClanId } from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import Clipboard from '@react-native-clipboard/clipboard';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { SeparatorWithLine } from '../../../../../components/Common';
import { threadDetailContext } from '../../../../../components/ThreadDetail/MenuThreadDetail';
import { MezonModal, MezonSwitch } from '../../../../../temp-ui';
import Backdrop from '../../../../../temp-ui/MezonBottomSheet/backdrop';
import { normalizeString } from '../../../../../utils/helpers';
import { FriendListItem } from '../../Reusables';
import { ExpireLinkValue, LINK_EXPIRE_OPTION, MAX_USER_OPTION } from '../../constants';
import { EMaxUserCanInvite } from '../../enums';
import { style } from './styles';

interface IInviteToChannelProp {
	isUnknownChannel: boolean;
	onClose?: () => void;
	isDMThread?: boolean;
}

interface IInviteToChannelIconProp {
	icon: React.JSX.Element;
	title: string;
	onPress?: () => void;
}

export const InviteToChannel = React.memo(
	React.forwardRef(({ isUnknownChannel, onClose, isDMThread = false }: IInviteToChannelProp, refRBSheet: React.Ref<BottomSheetModal>) => {
		const [isVisibleEditLinkModal, setIsVisibleEditLinkModal] = useState(false);
		const currentChannelId = useSelector(selectCurrentChannelId);
		const currentChannel = useContext(threadDetailContext);
		const reducedMotion = useReducedMotion();

		const [currentInviteLink, setCurrentInviteLink] = useState('');
		const [searchUserText, setSearchUserText] = useState('');
		const { themeValue } = useTheme();
		const styles = style(themeValue);
		const currentClanId = useSelector(selectCurrentClanId);
		const currentClan = useSelector(selectCurrentClan);
		const { createLinkInviteUser } = useInvite();
		const { t } = useTranslation(['inviteToChannel']);
		const timeoutRef = useRef(null);
		//TODO: get from API
		const [maxUserCanInviteSelected, setMaxUserCanInviteSelected] = useState<EMaxUserCanInvite>(EMaxUserCanInvite.Five);
		const [expiredTimeSelected, setExpiredTimeSelected] = useState<string>(ExpireLinkValue.SevenDays);
		const [isTemporaryMembership, setIsTemporaryMembership] = useState(true);
		const { listDMInvite, listUserInvite } = useDMInvite(isDMThread ? currentChannel?.channel_id : currentChannelId);
		const { createDirectMessageWithUser } = useDirect();
		const { sendInviteMessage } = useSendInviteMessage();
		const [sentIdList, setSentIdList] = useState<string[]>([]);
		const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
		const mezon = useMezon();

		const userInviteList = useMemo(() => {
			if (listDMInvite?.length) {
				return listDMInvite?.filter((dm) => normalizeString(dm?.channel_label).includes(normalizeString(searchUserText)));
			}
			return listUserInvite?.filter((UserInvite) => normalizeString(UserInvite?.user?.display_name).includes(normalizeString(searchUserText)));
		}, [searchUserText, listDMInvite, listUserInvite]);

		const openEditLinkModal = () => {
			//@ts-ignore
			refRBSheet?.current?.close();
			timeoutRef.current = setTimeout(() => {
				setIsVisibleEditLinkModal(true);
			}, 300);
		};

		const onVisibleEditLinkModalChange = (isVisible: boolean) => {
			if (!isVisible) {
				backToInviteModal();
			}
		};

		const backToInviteModal = () => {
			setIsVisibleEditLinkModal(false);
			//@ts-ignore
			refRBSheet.current.present();
		};

		const saveInviteLinkSettings = () => {
			//TODO: save invite link setting
			backToInviteModal();
		};

		const addInviteLinkToClipboard = useCallback(() => {
			Clipboard.setString(currentInviteLink);
			Toast.show({
				type: 'success',
				props: {
					text2: t('copyLink'),
					leadingIcon: <LinkIcon color={Colors.textLink} />,
				},
			});
		}, [currentInviteLink, t]);

		const resetSearch = () => {
			if (isVisibleEditLinkModal) {
				return;
			}
			setSearchUserText('');
		};

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
				let channelMode = 0;
				if (Number(response.type) === ChannelType.CHANNEL_TYPE_DM) {
					channelMode = ChannelStreamMode.STREAM_MODE_DM;
				}
				if (Number(response.type) === ChannelType.CHANNEL_TYPE_GROUP) {
					channelMode = ChannelStreamMode.STREAM_MODE_GROUP;
				}
				sendInviteMessage(currentInviteLink, response.channel_id, channelMode);
			}
		};

		const handleSendInVite = async (directParamId?: string, type?: number, userId?: string, dmGroup?: DirectEntity) => {
			if (userId) {
				directMessageWithUser(userId);
				setSentIdList([...sentIdList, userId]);
				return;
			}

			if (directParamId && dmGroup) {
				sendToDM({ text: currentInviteLink }, dmGroup);
				setSentIdList([...sentIdList, dmGroup?.id]);
				return;
			}
		};

		const fetchInviteLink = async () => {
			const response = await createLinkInviteUser(currentClanId ?? '', currentChannelId ?? '', 10);
			if (!response) {
				return;
			}
			setCurrentInviteLink(`https://mezon.vn/invite/${response.invite_link}`);
		};

		useEffect(() => {
			if (currentClanId && currentChannelId) {
				fetchInviteLink();
			}
		}, [currentClanId, currentChannelId]);

		useEffect(() => {
			const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
				setIsKeyboardVisible(true);
			});
			const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
				setIsKeyboardVisible(false);
			});

			return () => {
				keyboardDidShowListener.remove();
				keyboardDidHideListener.remove();
			};
		}, []);

		//TODO: delete
		const showUpdating = () => {
			Toast.show({
				type: 'info',
				text1: 'Coming soon',
			});
		};

		const inviteToChannelIconList = useMemo(() => {
			const iconList: IInviteToChannelIconProp[] = [
				{
					title: t('iconTitle.shareInvite'),
					icon: <Icons.ShareIcon color={themeValue.text} />,
					onPress: () => showUpdating(),
				},
				{
					title: t('iconTitle.copyLink'),
					icon: <Icons.LinkIcon color={themeValue.text} />,
					onPress: () => addInviteLinkToClipboard(),
				},
				{
					title: t('iconTitle.youtube'),
					icon: <Icons.BrandYoutubeIcon color={themeValue.text} />,
					onPress: () => showUpdating(),
				},
				{
					title: t('iconTitle.facebook'),
					icon: <Icons.BrandFacebookIcon color={themeValue.text} />,
					onPress: () => showUpdating(),
				},
				{
					title: t('iconTitle.twitter'),
					icon: <Icons.BrandTwitterIcon color={themeValue.text} />,
					onPress: () => showUpdating(),
				},
			];
			return iconList;
		}, [t, addInviteLinkToClipboard, themeValue]);

		const getInviteToChannelIcon = ({ icon, title, onPress }: IInviteToChannelIconProp) => {
			return (
				<Pressable style={styles.inviteIconWrapper} onPress={() => onPress()}>
					<View style={styles.shareToInviteIconWrapper}>{icon}</View>
					<Text style={styles.inviteIconText}>{title}</Text>
				</Pressable>
			);
		};

		const snapPoints = useMemo(() => {
			if (isKeyboardVisible) {
				return ['90%'];
			}
			return ['80%'];
		}, [isKeyboardVisible]);

		return (
			<View>
				<BottomSheetModal
					ref={refRBSheet}
					enableDynamicSizing={false}
					snapPoints={snapPoints}
					animateOnMount={!reducedMotion}
					index={0}
					enablePanDownToClose
					backdropComponent={Backdrop}
					onDismiss={() => {
						onClose?.();
            setSentIdList([]);
						resetSearch();
					}}
					handleComponent={() => null}
				>
					<View style={styles.bottomSheetWrapper}>
						{!isKeyboardVisible && (
							<View style={styles.inviteHeader}>
								<Text style={styles.inviteHeaderText}>{t('title')}</Text>
							</View>
						)}
						{isUnknownChannel ? (
							<Text style={styles.textUnknown}>{t('unknownChannel')}</Text>
						) : (
							<>
								{!isKeyboardVisible && (
									<View style={styles.iconAreaWrapper}>
										{inviteToChannelIconList.map((icon, index) => {
											return <View key={index}>{getInviteToChannelIcon(icon)}</View>;
										})}
									</View>
								)}

								<View style={styles.searchInviteFriendWrapper}>
									<View style={styles.searchFriendToInviteWrapper}>
										<TextInput
											placeholder={'Invite friend to channel'}
											placeholderTextColor={themeValue.text}
											style={styles.searchFriendToInviteInput}
											onChangeText={setSearchUserText}
										/>
										<Feather size={18} name="search" style={{ color: Colors.tertiary }} />
									</View>
									<View style={styles.editInviteLinkWrapper}>
										<Text style={styles.defaultText}>
											{t('yourLinkInvite')} {expiredTimeSelected}{' '}
										</Text>
										<Pressable onPress={() => openEditLinkModal()}>
											<Text style={styles.linkText}>{t('editInviteLink')}</Text>
										</Pressable>
									</View>
								</View>

								<BottomSheetFlatList
									data={userInviteList}
									keyExtractor={(item) => item?.id}
									ItemSeparatorComponent={() => {
										return <SeparatorWithLine style={{ backgroundColor: themeValue.border }} />;
									}}
									style={styles.inviteList}
									renderItem={({ item }) => {
										return (
											<FriendListItem
												key={item?.id}
												dmGroup={item}
												user={item}
												onPress={handleSendInVite}
												isSent={sentIdList.includes(item?.id)}
											/>
										);
									}}
								/>
							</>
						)}
					</View>
				</BottomSheetModal>

				{isVisibleEditLinkModal ? (
					<MezonModal
						visible={isVisibleEditLinkModal}
						title="Link Settings"
						confirmText="Save"
						onConfirm={saveInviteLinkSettings}
						visibleChange={onVisibleEditLinkModalChange}
					>
						<View style={styles.inviteChannelListWrapper}>
							<Text style={styles.inviteChannelListTitle}>{t('inviteChannel')}</Text>
							<View style={styles.channelInviteItem}>
								{/* <HashSignIcon width={18} height={18} /> */}
								<Text style={styles.channelInviteTitle}>{currentClan?.clan_name}</Text>
							</View>
						</View>
						<View style={styles.advancedSettingWrapper}>
							<Text style={styles.advancedSettingTitle}>{t('advancedSettings')}</Text>
							<Text style={styles.advancedSettingSubTitle}>{t('expireAfter')}</Text>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<View style={styles.radioContainer}>
									{LINK_EXPIRE_OPTION.map((option) => (
										<Pressable
											key={option.value}
											style={[
												styles.radioItem,
												option.value === expiredTimeSelected ? styles.radioItemActive : styles.radioItemDeActive,
											]}
											onPress={() => setExpiredTimeSelected(option.value)}
										>
											<Text
												style={[
													{
														color: option.value === expiredTimeSelected ? Colors.white : Colors.textGray,
														textAlign: 'center',
													},
												]}
											>
												{option.label}
											</Text>
										</Pressable>
									))}
								</View>
							</ScrollView>
							<Text style={styles.advancedSettingSubTitle}>{t('maxUsers')}</Text>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<View style={styles.radioContainer}>
									{MAX_USER_OPTION.map((option) => (
										<Pressable
											key={option}
											style={[
												styles.radioItem,
												option === maxUserCanInviteSelected ? styles.radioItemActive : styles.radioItemDeActive,
											]}
											onPress={() => setMaxUserCanInviteSelected(option)}
										>
											<Text
												style={[
													{
														color: option === maxUserCanInviteSelected ? Colors.white : Colors.textGray,
														textAlign: 'center',
													},
												]}
											>
												{option}
											</Text>
										</Pressable>
									))}
								</View>
							</ScrollView>
							<View style={styles.temporaryMemberWrapper}>
								<Text style={styles.temporaryMemberTitle}>{t('temporaryMembership')}</Text>
								<MezonSwitch value={isTemporaryMembership} onValueChange={setIsTemporaryMembership} />
							</View>
							<View style={{ flexDirection: 'row' }}>
								<Text style={{ color: Colors.textGray }}>{t('memberAutoKick')}</Text>
							</View>
						</View>
					</MezonModal>
				) : null}
			</View>
		);
	}),
);
