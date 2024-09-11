import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

import { useFriends } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { selectChannelById, selectDmGroupCurrent, selectFriendStatus, selectMemberClanByUserId, useAppSelector } from '@mezon/store';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MezonAvatar } from '../../../temp-ui';
import { style } from './styles';

interface IWelcomeMessage {
	channelId: string;
	uri?: string;
}

const WelcomeMessage = React.memo(({ channelId, uri }: IWelcomeMessage) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { t } = useTranslation(['userProfile']);
	const currenChannel = useAppSelector(selectChannelById(channelId)) || useAppSelector(selectDmGroupCurrent(channelId));
	const { acceptFriend, deleteFriend, addFriend } = useFriends();

	const isChannel = useMemo(() => {
		return currenChannel?.parrent_id === '0';
	}, [currenChannel?.parrent_id]);

	const isDM = useMemo(() => {
		return currenChannel?.clan_id === '0';
	}, [currenChannel?.clan_id]);

	const isDMGroup = useMemo(() => {
		return isDM && currenChannel?.user_id?.length > 1;
	}, [isDM, currenChannel?.user_id]);

	const stackUsers = useMemo(() => {
		const username = currenChannel?.category_name?.split(',');
		return isDMGroup
			? currenChannel?.channel_avatar?.map((avatar) => {
					return {
						avatarUrl: avatar,
						username: username?.shift() || 'Anonymous'
					};
				})
			: [];
	}, [isDMGroup, currenChannel?.user_id]);

	const creatorUser = useAppSelector(selectMemberClanByUserId(currenChannel?.creator_id));
	const checkAddFriend = useAppSelector(selectFriendStatus(currenChannel?.user_id?.[0]));

	const handleAddFriend = () => {
		addFriend({
			usernames: [],
			ids: [currenChannel?.user_id[0]]
		});
	};

	const handleAcceptFriend = () => {
		acceptFriend(currenChannel?.usernames, currenChannel?.user_id[0]);
	};

	const handleRemoveFriend = () => {
		deleteFriend(currenChannel?.usernames, currenChannel?.user_id[0]);
	};

	return (
		<View style={[styles.wrapperWelcomeMessage, isDMGroup && styles.wrapperCenter]}>
			{isDM ? (
				isDMGroup ? (
					<MezonAvatar height={50} width={50} avatarUrl={''} username={''} stacks={stackUsers} />
				) : (
					<MezonAvatar height={100} width={100} avatarUrl={currenChannel?.channel_avatar[0]} username={currenChannel?.usernames} />
				)
			) : (
				<View style={styles.iconWelcomeMessage}>
					{isChannel ? (
						<Icons.TextIcon width={50} height={50} color={themeValue.textStrong} />
					) : (
						<Icons.ThreadIcon width={50} height={50} color={themeValue.textStrong} />
					)}
				</View>
			)}

			{isDM ? (
				<View>
					<Text style={styles.titleWelcomeMessage}>{currenChannel?.channel_label}</Text>
					{!isDMGroup && <Text style={styles.subTitleUsername}>{currenChannel?.usernames}</Text>}
					{currenChannel?.user_id?.length > 1 ? (
						<Text style={styles.subTitleWelcomeMessageCenter}>{"Welcome to your new group! Invite friends whenever you're ready"}</Text>
					) : (
						<Text style={styles.subTitleWelcomeMessage}>
							{'This is the very beginning of your legendary conversation with ' + currenChannel?.usernames}
						</Text>
					)}

					{/* TODO: Mutual server */}
					{!isDMGroup && (
						<View style={styles.friendActions}>
							{checkAddFriend.noFriend && (
								<TouchableOpacity style={styles.addFriendButton} onPress={handleAddFriend}>
									<Text style={styles.buttonText}>{t('userAction.addFriend')}</Text>
								</TouchableOpacity>
							)}
							{checkAddFriend.friend && (
								<TouchableOpacity style={styles.deleteFriendButton} onPress={handleRemoveFriend}>
									<Text style={styles.buttonText}>{t('userAction.removeFriend')}</Text>
								</TouchableOpacity>
							)}
							{checkAddFriend.otherPendingFriend && (
								<View style={[styles.addFriendButton, { opacity: 0.6 }]}>
									<Text style={styles.buttonText}>{t('sendAddFriendSuccess')}</Text>
								</View>
							)}
							{checkAddFriend.myPendingFriend && (
								<View style={styles.friendActions}>
									<TouchableOpacity style={styles.addFriendButton} onPress={handleAcceptFriend}>
										<Text style={styles.buttonText}>{t('accept')}</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.blockButton} onPress={handleRemoveFriend}>
										<Text style={styles.buttonText}>{t('ignore')}</Text>
									</TouchableOpacity>
								</View>
							)}
							<Pressable style={styles.blockButton}>
								<Text style={styles.buttonText}>{t('pendingContent.block')}</Text>
							</Pressable>
						</View>
					)}
				</View>
			) : isChannel ? (
				<View>
					<Text style={styles.titleWelcomeMessage}>{'Welcome to #' + currenChannel?.channel_label}</Text>
					<Text style={styles.subTitleWelcomeMessage}>{'This is the start of the #' + currenChannel?.channel_label}</Text>
				</View>
			) : (
				<View>
					<Text style={styles.titleWelcomeMessage}>{currenChannel?.channel_label}</Text>
					<View style={{ flexDirection: 'row' }}>
						<Text style={styles.subTitleWelcomeMessage}>{'Started by '}</Text>
						<Text style={styles.subTitleWelcomeMessageWithHighlight}>{creatorUser?.user?.username || 'Anonymous'}</Text>
					</View>
				</View>
			)}
		</View>
	);
});

export default WelcomeMessage;
