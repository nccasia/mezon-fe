import { useCategory, useClans, useDirect, useDMInvite, useInvite, useSendInviteMessage } from '@mezon/core';
import { LinkIcon } from '@mezon/mobile-components';
import { Colors, useTheme } from '@mezon/mobile-ui';
import Clipboard from '@react-native-clipboard/clipboard';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import { MezonModal, MezonSwitch } from '../../../../../temp-ui';
import { normalizeString } from '../../../../../utils/helpers';
import { FriendListItem } from '../../Reusables';
import { ExpireLinkValue, LINK_EXPIRE_OPTION, MAX_USER_OPTION } from '../../constants';
import { EMaxUserCanInvite } from '../../enums';
import { style } from './styles';
import { BottomSheetModal, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import Backdrop from '../../../../../temp-ui/MezonBottomSheet/backdrop';
import { DirectEntity } from '@mezon/store-mobile';
import { useMezon } from '@mezon/transport';
import { ChannelStreamMode, ChannelType } from 'mezon-js';

interface IInviteToChannelProp {
   isUnknownChannel: boolean
}

export const InviteToChannel = React.memo(
	React.forwardRef(({ isUnknownChannel}: IInviteToChannelProp, refRBSheet: React.Ref<BottomSheetModal>) => {
		const [isVisibleEditLinkModal, setIsVisibleEditLinkModal] = useState(false);
		// const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
		const [currentInviteLink, setCurrentInviteLink] = useState('');
		const [searchUserText, setSearchUserText] = useState('');
		const { themeValue } = useTheme();
		const styles = style(themeValue);
		const { currentClanId, currentClan } = useClans();
		const { createLinkInviteUser } = useInvite();
		const { t } = useTranslation(['inviteToChannel']);
		const timeoutRef = useRef(null);
		//TODO: get from API
		const [maxUserCanInviteSelected, setMaxUserCanInviteSelected] = useState<EMaxUserCanInvite>(EMaxUserCanInvite.Five);
		const [expiredTimeSelected, setExpiredTimeSelected] = useState<string>(ExpireLinkValue.SevenDays);
		const [isTemporaryMembership, setIsTemporaryMembership] = useState(true);
		const { categorizedChannels } = useCategory();
		const { listDMInvite, listUserInvite } = useDMInvite(categorizedChannels.at(0)?.channels.at(0)?.channel_id);
		const { createDirectMessageWithUser } = useDirect();
		const { sendInviteMessage } = useSendInviteMessage();
		const [sentIdList, setSentIdList] = useState<string[]>([]);
		const mezon = useMezon();

		const userInviteList = useMemo(() => {
			if (listDMInvite.length) {
				return listDMInvite.filter(dm => normalizeString(dm?.channel_label).includes(normalizeString(searchUserText)))
			}
			return listUserInvite?.filter(UserInvite => normalizeString(UserInvite?.user?.display_name).includes(normalizeString(searchUserText)))
		}, [searchUserText, listDMInvite, listUserInvite])

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

		const addInviteLinkToClipboard = () => {
			Clipboard.setString(currentInviteLink);
			Toast.show({
				type: 'success',
				props: {
					text2: t('copyLink'),
					leadingIcon: <LinkIcon color={Colors.textLink} />,
				},
			});
		};

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
				let channelMode = 0
				if (Number(response.type) === ChannelType.CHANNEL_TYPE_DM) {
					channelMode = ChannelStreamMode.STREAM_MODE_DM
				}
				if (Number(response.type) === ChannelType.CHANNEL_TYPE_GROUP) {
					channelMode = ChannelStreamMode.STREAM_MODE_GROUP
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
			const channelId = categorizedChannels.at(0)?.channels.at(0)?.channel_id;
			const response = await createLinkInviteUser(currentClanId ?? '', channelId ?? '', 10);
			if (!response) {
				return;
			}
			setCurrentInviteLink(`https://mezon.vn/invite/${response.invite_link}`);
		}

		useEffect(() => {
			if (currentClanId) {
				fetchInviteLink();
			}
		}, [currentClanId]);

		return (
			<View>
				<BottomSheetModal
					ref={refRBSheet}
					enableDynamicSizing={false}
					snapPoints={['80%']}
					index={0}
            		animateOnMount
					backdropComponent={Backdrop}
					onDismiss={() => {
						resetSearch();
					}}
					handleComponent={() => null}
				>
					<View style={styles.bottomSheetWrapper}>
						<View style={styles.inviteHeader}>
							<Text style={styles.inviteHeaderText}>{t('title')}</Text>
						</View>
					{
						isUnknownChannel ? <Text style={styles.textUnknown}>{t('unknownChannel')}</Text> : (
						<>
							<View style={styles.iconAreaWrapper}>
								<Pressable style={styles.inviteIconWrapper}>
									<View style={styles.shareToInviteIconWrapper}>
										<Feather size={25} name="twitter" style={styles.shareToInviteIcon} />
									</View>
									<Text style={styles.inviteIconText}>{t('iconTitle.twitter')}</Text>
								</Pressable>
								<Pressable style={styles.inviteIconWrapper}>
									<View style={styles.shareToInviteIconWrapper}>
										<Feather size={25} name="facebook" style={styles.shareToInviteIcon} />
									</View>
									<Text style={styles.inviteIconText}>{t('iconTitle.faceBook')}</Text>
								</Pressable>
								<Pressable style={styles.inviteIconWrapper}>
									<View style={styles.shareToInviteIconWrapper}>
										<Feather size={25} name="youtube" style={styles.shareToInviteIcon} />
									</View>
									<Text style={styles.inviteIconText}>{t('iconTitle.youtube')}</Text>
								</Pressable>
								<Pressable style={styles.inviteIconWrapper}>
									<View style={styles.shareToInviteIconWrapper}>
										<Feather size={25} name="link" style={styles.shareToInviteIcon} onPress={() => addInviteLinkToClipboard()} />
									</View>
									<Text style={styles.inviteIconText}>{t('iconTitle.copyLink')}</Text>
								</Pressable>
								<Pressable style={styles.inviteIconWrapper}>
									<View style={styles.shareToInviteIconWrapper}>
										<Feather size={25} name="mail" style={styles.shareToInviteIcon} />
									</View>
									<Text style={styles.inviteIconText}>{t('iconTitle.email')}</Text>
								</Pressable>
							</View>

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
									<Text style={styles.defaultText}>{t('yourLinkInvite')} {expiredTimeSelected} </Text>
									<Pressable onPress={() => openEditLinkModal()}>
									<Text style={styles.linkText}>{t('editInviteLink')}</Text>
									</Pressable>
								</View>
							</View>
							
							<BottomSheetFlatList
								data={userInviteList}
								keyExtractor={(item) => item?.id}
								renderItem={({ item }) => {
									return <FriendListItem
										key={item?.id}
										dmGroup={item}
										user={item}
										onPress={handleSendInVite}
										isSent={sentIdList.includes(item?.id)}
									/>
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
													{ color: option.value === expiredTimeSelected ? Colors.white : Colors.textGray, textAlign: 'center' },
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
													{ color: option === maxUserCanInviteSelected ? Colors.white : Colors.textGray, textAlign: 'center' },
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
								<Text style={{ color: Colors.textGray }}>
									{t('memberAutoKick')}
								</Text>
							</View>
						</View>
					</MezonModal>
				): null}
			</View>
		);
	}),
);
