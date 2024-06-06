import { useAuth, useMemberStatus, useRoles } from '@mezon/core';
import { CallIcon, CloseIcon, MessageIcon, VideoIcon } from '@mezon/mobile-components';
import { Metrics, size } from '@mezon/mobile-ui';
import { selectCurrentChannelId, selectMemberByUserId } from '@mezon/store-mobile';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import MezonAvatar from '../../../../../../app/temp-ui/MezonAvatar';
import { styles } from './UserProfile.styles';
import { useMixImageColor } from '../../../../../../app/hooks/useMixImageColor';

interface userProfileProps {
	userId: string;
}

const UserProfile = ({ userId }: userProfileProps) => {
	const { userProfile } = useAuth();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const { t } = useTranslation(['userProfile']);
	const userById = useSelector(selectMemberByUserId(userId ?? ''));
	const userStatus = useMemberStatus(userId || '');
	const { RolesClan } = useRoles(currentChannelId || '');
	const { color } = useMixImageColor(userProfile?.user?.avatar_url || userById?.user?.avatar_url);

	const userRolesClan = useMemo(() => {
		return userById?.role_id ? RolesClan.filter((role) => userById?.role_id?.includes(role.id)) : [];
	}, [userById?.role_id, RolesClan]);

	const checkOwner = (userId: string) => {
		return userId === userProfile?.user?.google_id;
	};

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
							avatarUrl={userById?.user?.avatar_url}
							userName={userById?.user?.username}
							userStatus={userStatus}
						/>
					</View>
				</View>
				<View style={[styles.container]}>
					<View style={[styles.userInfo]}>
						<Text style={[styles.userName]}>{userById?.user?.username}</Text>
						<Text style={[styles.subUserName]}>{userById?.user?.display_name}</Text>
						{!checkOwner(userById?.user?.google_id || '') && (
							<View style={[styles.userAction]}>
								<View style={[styles.actionItem]}>
									<MessageIcon width={20} height={20}></MessageIcon>
									<Text style={[styles.actionText]}>{t('userAction.sendMessage')}</Text>
								</View>
								<View style={[styles.actionItem]}>
									<CallIcon width={20} height={20}></CallIcon>
									<Text style={[styles.actionText]}>{t('userAction.voiceCall')}</Text>
								</View>
								<View style={[styles.actionItem]}>
									<VideoIcon width={20} height={20}></VideoIcon>
									<Text style={[styles.actionText]}>{t('userAction.videoCall')}</Text>
								</View>
							</View>
						)}
					</View>
					<View style={[styles.userInfo]}>
						<Text style={[styles.aboutMe]}>{t('aboutMe.headerTitle')}</Text>
						<Text style={[styles.title]}>{t('aboutMe.roles.headerTitle')}</Text>
						<View style={[styles.roles]}>
							{userRolesClan.length
								? userRolesClan.map((role, index) => (
										<View style={[styles.roleItem]} key={`${role.id}_${index}`}>
											<CloseIcon width={15} height={15}></CloseIcon>
											<Text style={[styles.textRole]}>{role?.title}</Text>
										</View>
									))
								: null}
						</View>
					</View>
				</View>
			</View>
		</ScrollView>
	);
};

export default UserProfile;
