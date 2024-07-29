import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useAuth, useFriends, useMemberCustomStatus } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { Block, size, useTheme } from '@mezon/mobile-ui';
import { FriendsEntity, channelMembersActions, selectCurrentClanId, useAppDispatch } from '@mezon/store-mobile';
import { CircleXIcon } from 'libs/mobile-components/src/lib/icons2';
import moment from 'moment';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import AddStatusUserModal from '../../components/AddStatusUserModal';
import CustomStatusUser from '../../components/CustomStatusUser';
import { useMixImageColor } from '../../hooks/useMixImageColor';
import { APP_SCREEN } from '../../navigation/ScreenTypes';
import { MezonButton } from '../../temp-ui';
import { style } from './styles';

export enum ETypeCustomUserStatus {
	Save = 'Save',
	Close = 'Close',
}

const ProfileScreen = ({ navigation }: { navigation: any }) => {
	const user = useAuth();
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { friends: allUser } = useFriends();
	const { color } = useMixImageColor(user?.userProfile?.user?.avatar_url);
	const { t } = useTranslation('profile');
	const [isVisibleAddStatusUserModal, setIsVisibleAddStatusUserModal] = useState<boolean>(false);
	const userStatusBottomSheetRef = useRef<BottomSheetModal>(null);
	const userCustomStatus = useMemberCustomStatus(user?.userProfile?.user?.id || '');
	const currentClanId = useSelector(selectCurrentClanId);
	const dispatch = useAppDispatch();
	const { dismiss } = useBottomSheetModal();

	const friendList: FriendsEntity[] = useMemo(() => {
		return allUser.filter((user) => user.state === 0);
	}, [allUser]);

	const navigateToFriendScreen = () => {
		navigation.navigate(APP_SCREEN.FRIENDS.STACK, { screen: APP_SCREEN.FRIENDS.HOME });
	};
	const navigateToSettingScreen = () => {
		navigation.navigate(APP_SCREEN.SETTINGS.STACK, { screen: APP_SCREEN.SETTINGS.HOME });
	};

	const navigateToProfileSetting = () => {
		navigation.navigate(APP_SCREEN.SETTINGS.STACK, { screen: APP_SCREEN.SETTINGS.PROFILE });
	};

	const firstFriendImageList = useMemo(() => {
		return friendList?.slice?.(0, 5)?.map((friend) => friend?.user?.avatar_url);
	}, [friendList]);

	const memberSince = useMemo(() => {
		return moment(user?.userProfile?.user?.create_time).format('MMM DD, YYYY');
	}, [user]);

	const handlePressSetCustomStatus = () => {
		setIsVisibleAddStatusUserModal(!isVisibleAddStatusUserModal);
	};

	const handleCustomUserStatus = (customStatus: string = '', type: ETypeCustomUserStatus) => {
		userStatusBottomSheetRef?.current?.dismiss();
		setIsVisibleAddStatusUserModal(false);
		dispatch(channelMembersActions.updateCustomStatus({ clanId: currentClanId ?? '', customStatus: customStatus }));
	};

	return (
		<View style={styles.container}>
			<View style={[styles.containerBackground, { backgroundColor: color }]}>
				<View style={styles.backgroundListIcon}>
					<TouchableOpacity style={styles.backgroundSetting} onPress={() => navigateToSettingScreen()}>
						<Icons.SettingsIcon height={20} width={20} color={themeValue.textStrong} />
					</TouchableOpacity>
				</View>

				<TouchableOpacity
					onPress={() => {
						userStatusBottomSheetRef?.current?.present();
					}}
					style={styles.viewImageProfile}
				>
					{user?.userProfile?.user?.avatar_url ? (
						<Image source={{ uri: user?.userProfile?.user?.avatar_url }} style={styles.imgWrapper} />
					) : (
						<Block overflow={'hidden'} width={'100%'} height={'100%'} borderRadius={50}>
							<Text style={styles.textAvatar}>{user?.userProfile?.user?.username?.charAt?.(0)?.toUpperCase()}</Text>
						</Block>
					)}
					<View style={styles.dotOnline} />
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.contentWrapper}>
				<View style={styles.contentContainer}>
					<TouchableOpacity style={styles.viewInfo} onPress={() => Toast.show({ type: 'info', text1: 'Updating...' })}>
						<Text style={styles.textName}>{user?.userProfile?.user?.display_name}</Text>
						<Icons.ChevronSmallDownIcon height={18} width={18} color={themeValue.text} />
					</TouchableOpacity>
					<Text style={styles.text}>{user?.userProfile?.user?.username}</Text>
					{userCustomStatus ? (
						<Block flexDirection="row" alignItems="center" justifyContent="space-between">
							<TouchableOpacity
								onPress={() => setIsVisibleAddStatusUserModal(!isVisibleAddStatusUserModal)}
								style={styles.customUserStatusBtn}
							>
								<Text style={styles.text}>{userCustomStatus}</Text>
							</TouchableOpacity>
							<Pressable onPress={() => handleCustomUserStatus('', ETypeCustomUserStatus.Close)} style={styles.closeBtnUserStatus}>
								<CircleXIcon height={18} width={18} color={themeValue.text} />
							</Pressable>
						</Block>
					) : null}
					<View style={styles.buttonList}>
						<MezonButton viewContainerStyle={styles.button} onPress={() => setIsVisibleAddStatusUserModal(!isVisibleAddStatusUserModal)}>
							<Icons.ChatIcon height={20} width={20} color={'white'} />
							<Text style={styles.whiteText}>{t('addStatus')}</Text>
						</MezonButton>

						<MezonButton viewContainerStyle={styles.button} onPress={() => navigateToProfileSetting()}>
							<Icons.PencilIcon height={18} width={18} color={'white'} />
							<Text style={styles.whiteText}>{t('editStatus')}</Text>
						</MezonButton>
					</View>
				</View>

				<View style={styles.contentContainer}>
					<View style={{ gap: size.s_20 }}>
						{user?.userProfile?.user?.about_me ? (
							<View>
								<Text style={styles.textTitle}>{t('aboutMe')}</Text>
								<Text style={styles.text}>{user?.userProfile?.user?.about_me}</Text>
							</View>
						) : null}

						<View>
							<Text style={styles.textTitle}>{t('mezonMemberSince')}</Text>
							<Text style={styles.text}>{memberSince}</Text>
						</View>
					</View>
				</View>

				<TouchableOpacity style={[styles.contentContainer, styles.imgList]} onPress={() => navigateToFriendScreen()}>
					<Text style={styles.textTitle}>{t('yourFriend')}</Text>
					<View style={styles.listImageFriend}>
						{firstFriendImageList.map((imgUrl, idx) => {
							return (
								<View key={idx} style={[styles.imageContainer, { right: idx * 20 }]}>
									<Image source={{ uri: imgUrl }} style={styles.imageFriend} />
								</View>
							);
						})}
					</View>
					<Icons.ChevronSmallRightIcon width={18} height={18} style={{ marginLeft: size.s_4 }} color={themeValue.textStrong} />
				</TouchableOpacity>
			</ScrollView>
			<AddStatusUserModal
				userCustomStatus={userCustomStatus}
				isVisible={isVisibleAddStatusUserModal}
				setIsVisible={(value) => {
					setIsVisibleAddStatusUserModal(value);
				}}
				handleCustomUserStatus={handleCustomUserStatus}
			/>
			<CustomStatusUser
				userCustomStatus={userCustomStatus}
				onPressSetCustomStatus={handlePressSetCustomStatus}
				ref={userStatusBottomSheetRef}
				handleCustomUserStatus={handleCustomUserStatus}
			/>
		</View>
	);
};

export default ProfileScreen;
