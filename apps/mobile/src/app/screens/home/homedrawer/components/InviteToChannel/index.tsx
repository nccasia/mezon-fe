import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Colors, useTheme } from '@mezon/mobile-ui';
import { selectCurrentClan } from '@mezon/store-mobile';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { MezonModal, MezonSwitch } from '../../../../../componentUI';
import Backdrop from '../../../../../componentUI/MezonBottomSheet/backdrop';
import { ExpireLinkValue, LINK_EXPIRE_OPTION, MAX_USER_OPTION } from '../../constants';
import { EMaxUserCanInvite } from '../../enums';
import { FriendList } from './FriendList';
import { style } from './styles';

interface IInviteToChannelProp {
	isUnknownChannel: boolean;
	onClose?: () => void;
	isDMThread?: boolean;
}

export const InviteToChannel = React.memo(
	React.forwardRef(
		({ isUnknownChannel, onClose, isDMThread = false }: IInviteToChannelProp, refRBSheet: React.MutableRefObject<BottomSheetModal>) => {
			const [isVisibleEditLinkModal, setIsVisibleEditLinkModal] = useState(false);
			const reducedMotion = useReducedMotion();

			const { themeValue } = useTheme();
			const styles = style(themeValue);
			const currentClan = useSelector(selectCurrentClan);
			const { t } = useTranslation(['inviteToChannel']);
			const timeoutRef = useRef(null);
			//TODO: get from API
			const [maxUserCanInviteSelected, setMaxUserCanInviteSelected] = useState<EMaxUserCanInvite>(EMaxUserCanInvite.Five);
			const [expiredTimeSelected, setExpiredTimeSelected] = useState<string>(ExpireLinkValue.SevenDays);
			const [isTemporaryMembership, setIsTemporaryMembership] = useState(true);
			const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

			const openEditLinkModal = useCallback(() => {
				refRBSheet?.current?.close();
				timeoutRef.current = setTimeout(() => {
					setIsVisibleEditLinkModal(true);
				}, 300);
			}, []);

			const onVisibleEditLinkModalChange = (isVisible: boolean) => {
				if (!isVisible) {
					backToInviteModal();
				}
			};

			const backToInviteModal = () => {
				setIsVisibleEditLinkModal(false);
				refRBSheet.current.present();
			};

			const saveInviteLinkSettings = () => {
				//TODO: save invite link setting
				backToInviteModal();
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
							// setSentIdList([]);
							// resetSearch();
						}}
						handleComponent={() => null}
					>
						<FriendList
							isUnknownChannel={isUnknownChannel}
							expiredTimeSelected={expiredTimeSelected}
							isDMThread={isDMThread}
							isKeyboardVisible={isKeyboardVisible}
							openEditLinkModal={openEditLinkModal}
						/>
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
													option.value === expiredTimeSelected ? styles.radioItemActive : styles.radioItemDeActive
												]}
												onPress={() => setExpiredTimeSelected(option.value)}
											>
												<Text
													style={[
														{
															color: option.value === expiredTimeSelected ? Colors.white : Colors.textGray,
															textAlign: 'center'
														}
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
													option === maxUserCanInviteSelected ? styles.radioItemActive : styles.radioItemDeActive
												]}
												onPress={() => setMaxUserCanInviteSelected(option)}
											>
												<Text
													style={[
														{
															color: option === maxUserCanInviteSelected ? Colors.white : Colors.textGray,
															textAlign: 'center'
														}
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
		}
	)
);
