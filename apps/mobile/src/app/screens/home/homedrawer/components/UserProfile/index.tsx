import { useAuth, useDirect, useMemberStatus, useRoles } from '@mezon/core';
import { CallIcon, CloseIcon, MessageIcon, VideoIcon } from '@mezon/mobile-components';
import { Metrics, size } from '@mezon/mobile-ui';
import { selectCurrentChannelId, selectDirectsOpenlist, selectMemberByUserId } from '@mezon/store-mobile';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { useMixImageColor } from '../../../../../../app/hooks/useMixImageColor';
import MezonAvatar from '../../../../../../app/temp-ui/MezonAvatar';
import { styles } from './UserProfile.styles';
import { useNavigation } from '@react-navigation/native';
import { APP_SCREEN } from '../../../../../../app/navigation/ScreenTypes';
import { User } from 'mezon-js';

interface userProfileProps {
	userId?: string;
	user?: User;
	onClose?: () => void
}

const UserProfile = ({ userId, user, onClose }: userProfileProps) => {
	const { userProfile } = useAuth();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const { t } = useTranslation(['userProfile']);
	const userById = useSelector(selectMemberByUserId(userId ?? ''));
	const userStatus = useMemberStatus(userId || user?.id);
	const { RolesClan } = useRoles(currentChannelId || '');
	const { color } = useMixImageColor(userById?.user?.avatar_url || userProfile?.user?.avatar_url);
	const navigation = useNavigation<any>();
	const { createDirectMessageWithUser } = useDirect();
	const listDM = useSelector(selectDirectsOpenlist);

	const userRolesClan = useMemo(() => {
		return userById?.role_id ? RolesClan.filter((role) => userById?.role_id?.includes(role.id)) : [];
	}, [userById?.role_id, RolesClan]);

	const checkOwner = (userId: string) => {
		return userId === userProfile?.user?.google_id;
	};

	const directMessageWithUser = useCallback(async (userId: string) => {
        const directMessage = listDM.find(dm => dm?.user_id?.length === 1 && dm?.user_id[0] === userId);
        if (directMessage?.id) {
            navigation.navigate(APP_SCREEN.MESSAGES.STACK, { screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL, params: { directMessageId: directMessage?.id } });
            return;
        }
		const response = await createDirectMessageWithUser(userId);
		if (response?.channel_id) {
            navigation.navigate(APP_SCREEN.MESSAGES.STACK, { screen: APP_SCREEN.MESSAGES.MESSAGE_DETAIL, params: { directMessageId: response?.channel_id } });
		}
	}, [createDirectMessageWithUser, listDM, navigation]);

	const navigateToMessageDetail = () => {
		if (onClose && typeof onClose === 'function') {
			onClose();
		}
		directMessageWithUser(userId || user?.id);
	}

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			style={{ height: Metrics.screenHeight / (Platform.OS === 'ios' ? 1.4 : 1.3) }}
			contentContainerStyle={{ paddingBottom: size.s_10 }}
		>
			<View style={[styles.wrapper]}>
				<View style={[styles.backdrop, { backgroundColor: color }]}>
					<View style={[styles.userAvatar]}>
						<MezonAvatar
							width={80}
							height={80}
							avatarUrl={userById?.user?.avatar_url || user?.avatar_url}
							userName={userById?.user?.username || user?.display_name}
							userStatus={userStatus}
              				isBorderBoxImage={true}
						/>
					</View>
				</View>
				<View style={[styles.container]}>
					<View style={[styles.userInfo]}>
						<Text style={[styles.userName]}>{userById?.user?.username || user?.username}</Text>
						<Text style={[styles.subUserName]}>{userById?.user?.display_name || user?.display_name}</Text>
						{!checkOwner(userById?.user?.google_id || '') && (
							<View style={[styles.userAction]}>
								<TouchableOpacity onPress={() => navigateToMessageDetail()} style={[styles.actionItem]}>
									<MessageIcon width={25} height={20}></MessageIcon>
									<Text style={[styles.actionText]}>{t('userAction.sendMessage')}</Text>
								</TouchableOpacity>
								<View style={[styles.actionItem]}>
									<CallIcon width={25} height={20}></CallIcon>
									<Text style={[styles.actionText]}>{t('userAction.voiceCall')}</Text>
								</View>
								<View style={[styles.actionItem]}>
									<VideoIcon width={20} height={20}></VideoIcon>
									<Text style={[styles.actionText]}>{t('userAction.videoCall')}</Text>
								</View>
							</View>
						)}
					</View>
					{userById?.user?.about_me || userRolesClan.length ? (
						<View style={[styles.userInfo]}>
							{userById?.user?.about_me && (
								<View>
									<Text style={[styles.aboutMe]}>{t('aboutMe.headerTitle')}</Text>
									<Text style={[styles.aboutMeText]}>{userById?.user?.about_me}</Text>
								</View>
							)}
							{userRolesClan.length
								? (<View style={[styles.roles]}>
									<Text style={[styles.title]}>{t('aboutMe.roles.headerTitle')}</Text>
									{userRolesClan.map((role, index) => (
										<View style={[styles.roleItem]} key={`${role.id}_${index}`}>
											<CloseIcon width={15} height={15}></CloseIcon>
											<Text style={[styles.textRole]}>{role?.title}</Text>
										</View>
									))}
								</View>)
							: null}
						</View>
					): null}
				</View>
			</View>
		</ScrollView>
	);
};

export default UserProfile;
