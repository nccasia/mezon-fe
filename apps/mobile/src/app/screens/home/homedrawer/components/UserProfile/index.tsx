import { useAuth, useDirect, useFriends, useMemberCustomStatus, useMemberStatus } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { Block, Colors, size, useTheme } from '@mezon/mobile-ui';
import { useAppSelector } from '@mezon/store';
import { selectAllRolesClan, selectDirectsOpenlist, selectMemberClanByUserId } from '@mezon/store-mobile';
import { IMessageWithUser } from '@mezon/utils';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { useMixImageColor } from '../../../../../../app/hooks/useMixImageColor';
import { APP_SCREEN } from '../../../../../../app/navigation/ScreenTypes';
import MezonAvatar from '../../../../../../app/temp-ui/MezonAvatar';
import { style } from './UserProfile.styles';
import EditUserProfileBtn from './component/EditUserProfileBtn';
import { PendingContent } from './component/PendingContent';
import UserSettingProfile from './component/UserSettingProfile';

interface userProfileProps {
	userId?: string;
	user?: any;
	message?: IMessageWithUser;
	checkAnonymous?: boolean;
	onClose?: () => void;
	showAction?: boolean;
	showRole?: boolean;
}

export enum EFriendState {
	Friend,
	SentRequestFriend,
	ReceivedRequestFriend,
	Block
}

const UserProfile = React.memo(({ userId, user, onClose, checkAnonymous, message, showAction = true, showRole = true }: userProfileProps) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { userProfile } = useAuth();
	const { t } = useTranslation(['userProfile']);
	const userById = useAppSelector(selectMemberClanByUserId(userId || user?.id));
	const userStatus = useMemberStatus(userId || user?.id);
	const rolesClan = useSelector(selectAllRolesClan);
	const { color } = useMixImageColor(userById?.clan_avatar || userById?.user?.avatar_url || userProfile?.user?.avatar_url);
	const navigation = useNavigation<any>();
	const { createDirectMessageWithUser } = useDirect();
	const listDM = useSelector(selectDirectsOpenlist);
	const userCustomStatus = useMemberCustomStatus(userId || user?.id || '');
	const { friends: allUser = [], acceptFriend, deleteFriend, addFriend } = useFriends();
	const [isShowPendingContent, setIsShowPendingContent] = useState(false);

	const isKicked = useMemo(() => {
		return !userById;
	}, [userById]);

	const targetUser = useMemo(() => {
		return allUser.find((targetUser) => [user?.id, userId].includes(targetUser?.user?.id));
	}, [user?.id, userId, allUser]);

	const userRolesClan = useMemo(() => {
		return userById?.role_id ? rolesClan?.filter?.((role) => userById?.role_id?.includes(role.id)) : [];
	}, [userById?.role_id, rolesClan]);

	const checkOwner = (userId: string) => {
		const id = userProfile?.user?.google_id || userProfile?.user?.id;
		return userId === id;
	};

	const directMessageWithUser = useCallback(
		async (userId: string) => {
			const directMessage = listDM.find((dm) => dm?.user_id?.length === 1 && dm?.user_id[0] === userId);
			if (directMessage?.id) {
				navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
					screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
					params: { directMessageId: directMessage?.id }
				});
				return;
			}
			const response = await createDirectMessageWithUser(userId);
			if (response?.channel_id) {
				navigation.navigate(APP_SCREEN.MESSAGES.STACK, {
					screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL,
					params: { directMessageId: response?.channel_id }
				});
			}
		},
		[createDirectMessageWithUser, listDM, navigation]
	);

	const navigateToMessageDetail = () => {
		if (onClose && typeof onClose === 'function') {
			onClose();
		}
		directMessageWithUser(userId || user?.id);
	};

	const actionList = [
		{
			id: 1,
			text: t('userAction.sendMessage'),
			icon: <Icons.ChatIcon color={themeValue.text} />,
			action: navigateToMessageDetail,
			isShow: true
		},
		// {
		// 	id: 2,
		// 	text: t('userAction.voiceCall'),
		// 	icon: <Icons.PhoneCallIcon color={themeValue.text} />,
		// 	action: () => {
		// 		//TODO
		// 		Toast.show({ type: 'info', text1: 'Updating...' });
		// 	},
		// 	isShow: true
		// },
		// {
		// 	id: 3,
		// 	text: t('userAction.videoCall'),
		// 	icon: <Icons.VideoIcon color={themeValue.text} />,
		// 	action: () => {
		// 		//TODO
		// 		Toast.show({ type: 'info', text1: 'Updating...' });
		// 	},
		// 	isShow: true
		// },
		{
			id: 4,
			text: t('userAction.addFriend'),
			icon: <Icons.UserPlusIcon color={Colors.green} />,
			action: () => {
				const userIdToAddFriend = userId || user?.id;
				if (userIdToAddFriend) {
					addFriend({
						usernames: [],
						ids: [userIdToAddFriend]
					});
				}
			},
			isShow: !targetUser,
			textStyles: {
				color: Colors.green
			}
		},
		{
			id: 5,
			text: t('userAction.pending'),
			icon: <Icons.ClockIcon color={Colors.goldenrodYellow} />,
			action: () => {
				setIsShowPendingContent(true);
			},
			isShow: !!targetUser && [EFriendState.ReceivedRequestFriend, EFriendState.SentRequestFriend].includes(targetUser?.state),
			textStyles: {
				color: Colors.goldenrodYellow
			}
		}
	];

	const handleAcceptFriend = () => {
		acceptFriend(targetUser?.user?.username, targetUser?.user?.id);
	};

	const handleIgnoreFriend = () => {
		deleteFriend(targetUser?.user?.username, targetUser?.user?.id);
	};

	const isShowUserContent = useMemo(() => {
		return !!userById?.user?.about_me || (showRole && userRolesClan?.length) || showAction;
	}, [userById?.user?.about_me, showAction, showRole, userRolesClan]);

	if (isShowPendingContent) {
		return (
			<View style={[styles.wrapper]}>
				<PendingContent targetUser={targetUser} onClose={() => setIsShowPendingContent(false)} />
			</View>
		);
	}

	return (
		<View style={[styles.wrapper]}>
			<View style={[styles.backdrop, { backgroundColor: userById || user?.avatar_url ? color : Colors.titleReset }]}>
				<View style={[styles.userAvatar]}>
					<MezonAvatar
						width={size.s_80}
						height={size.s_80}
						avatarUrl={userById?.clan_avatar || userById?.user?.avatar_url || user?.avatar_url}
						username={userById?.clan_nick || user?.display_name || userById?.user?.username}
						userStatus={userStatus}
						isBorderBoxImage={true}
					/>
				</View>
			</View>
			<View style={[styles.container]}>
				<View style={[styles.userInfo]}>
					<Text style={[styles.userName]}>
						{userById
							? userById.clan_nick || userById?.user?.display_name || userById?.user?.username
							: user?.username || (checkAnonymous ? 'Anonymous' : message?.username)}
					</Text>
					<Text style={[styles.subUserName]}>
						{userById ? userById?.user?.username : user?.username || (checkAnonymous ? 'Anonymous' : message?.username)}
					</Text>
					{userCustomStatus ? <Text style={styles.customStatusText}>{userCustomStatus}</Text> : null}
					{checkOwner(userById?.user?.google_id || userById?.user?.id) && <EditUserProfileBtn user={userById || (user as any)} />}
					{!checkOwner(userById?.user?.google_id || userById?.user?.id) && (
						<View style={[styles.userAction]}>
							{actionList.map((actionItem) => {
								const { action, icon, id, isShow, text, textStyles } = actionItem;
								if (!isShow) return null;
								return (
									<TouchableOpacity key={id} onPress={() => action()} style={[styles.actionItem]}>
										{icon}
										<Text style={[styles.actionText, textStyles && textStyles]}>{text}</Text>
									</TouchableOpacity>
								);
							})}
						</View>
					)}
					{EFriendState.ReceivedRequestFriend === targetUser?.state && (
						<Block marginTop={size.s_16}>
							<Text style={styles.receivedFriendRequestTitle}>{t('incomingFriendRequest')}</Text>
							<Block flexDirection="row" gap={size.s_10} marginTop={size.s_10}>
								<TouchableOpacity onPress={() => handleAcceptFriend()} style={[styles.button, { backgroundColor: Colors.green }]}>
									<Text style={styles.defaultText}>{t('accept')}</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => handleIgnoreFriend()}
									style={[styles.button, { backgroundColor: Colors.bgGrayDark }]}
								>
									<Text style={styles.defaultText}>{t('ignore')}</Text>
								</TouchableOpacity>
							</Block>
						</Block>
					)}
				</View>

				{isShowUserContent && (
					<View style={[styles.roleGroup]}>
						{userById?.user?.about_me && (
							<Block padding={size.s_16}>
								<Text style={[styles.aboutMe]}>{t('aboutMe.headerTitle')}</Text>
								<Text style={[styles.aboutMeText]}>{userById?.user?.about_me}</Text>
							</Block>
						)}

						{userRolesClan?.length && showRole ? (
							<Block padding={size.s_16}>
								<Text style={[styles.title]}>{t('aboutMe.roles.headerTitle')}</Text>
								<View style={[styles.roles]}>
									{userRolesClan?.map((role, index) => (
										<View style={[styles.roleItem]} key={`${role.id}_${index}`}>
											<Block width={15} height={15} borderRadius={50} backgroundColor={Colors.bgToggleOnBtn}></Block>
											<Text style={[styles.textRole]}>{role?.title}</Text>
										</View>
									))}
								</View>
							</Block>
						) : null}

						{showAction && !isKicked && <UserSettingProfile user={userById || (user as any)} />}
					</View>
				)}
			</View>
		</View>
	);
});

export default UserProfile;
