import { useChatMessages } from '@mezon/core';
import { Icons, IUserStatus } from '@mezon/mobile-components';
import { size } from '@mezon/mobile-ui';
import { directActions, directMetaActions, MessagesEntity, useAppDispatch } from '@mezon/store-mobile';
import { TIME_OFFSET } from '@mezon/utils';
import React, { useCallback, useEffect, useRef } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { UserStatus } from '../../../components/UserStatus';

interface HeaderProps {
	handleBack: () => void;
	navigateToThreadDetail: () => void;
	isTypeDMGroup: boolean;
	dmAvatar: string | null;
	dmLabel: string;
	userStatus: IUserStatus;
	styles: any;
	themeValue: any;
	directMessageId: string;
}

function useChannelSeen(channelId: string) {
	const dispatch = useAppDispatch();
	const { lastMessage } = useChatMessages({ channelId });
	const mounted = useRef('');

	const updateChannelSeenState = useCallback(
		(channelId: string, lastMessage: MessagesEntity) => {
			const timestamp = Date.now() / 1000;
			dispatch(directMetaActions.setDirectLastSeenTimestamp({ channelId, timestamp: timestamp + TIME_OFFSET }));
			dispatch(directMetaActions.updateLastSeenTime(lastMessage));
			dispatch(directActions.setActiveDirect({ directId: channelId }));
		},
		[dispatch]
	);

	useEffect(() => {
		if (lastMessage) {
			updateChannelSeenState(channelId, lastMessage);
		}
	}, [channelId, lastMessage, updateChannelSeenState]);

	useEffect(() => {
		if (mounted.current === channelId) {
			return;
		}
		if (lastMessage) {
			mounted.current = channelId;
			updateChannelSeenState(channelId, lastMessage);
		}
	}, [dispatch, channelId, lastMessage, updateChannelSeenState]);
}

const HeaderDirectMessage: React.FC<HeaderProps> = ({
	handleBack,
	navigateToThreadDetail,
	isTypeDMGroup,
	dmAvatar,
	dmLabel,
	userStatus,
	styles,
	themeValue,
	directMessageId
}) => {
	useChannelSeen(directMessageId || '');

	return (
		<View style={styles.headerWrapper}>
			<Pressable onPress={handleBack} style={styles.backButton}>
				<Icons.ArrowLargeLeftIcon color={themeValue.text} height={size.s_20} width={size.s_20} />
			</Pressable>
			<Pressable style={styles.channelTitle} onPress={navigateToThreadDetail}>
				{isTypeDMGroup ? (
					<View style={styles.groupAvatar}>
						<Icons.GroupIcon width={18} height={18} />
					</View>
				) : (
					<View style={styles.avatarWrapper}>
						{dmAvatar ? (
							<Image source={{ uri: dmAvatar || '' }} style={styles.friendAvatar} />
						) : (
							<View style={styles.wrapperTextAvatar}>
								<Text style={[styles.textAvatar]}>{dmLabel?.charAt?.(0)}</Text>
							</View>
						)}
						<UserStatus status={userStatus} />
					</View>
				)}
				<Text style={styles.titleText} numberOfLines={1}>
					{dmLabel}
				</Text>
			</Pressable>
		</View>
	);
};

export default React.memo(HeaderDirectMessage);
