import React from 'react';
import { Text, View } from 'react-native';

import { Icons } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import { selectChannelById, selectDmGroupCurrent, selectMemberClanByUserId, useAppSelector } from '@mezon/store';
import { useMemo } from 'react';
import { MezonAvatar } from '../../../temp-ui';
import { style } from './styles';

interface IWelcomeMessage {
	channelId: string;
	uri?: string;
}

const WelcomeMessage = React.memo(({ channelId, uri }: IWelcomeMessage) => {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const currenChannel = useAppSelector(selectChannelById(channelId)) ||
		useAppSelector(selectDmGroupCurrent(channelId));

	const isChannel = useMemo(() => {
		return currenChannel?.parrent_id === "0";
	}, [currenChannel?.parrent_id])

	const isDM = useMemo(() => {
		return currenChannel?.clan_id === "0";
	}, [currenChannel?.clan_id]);

	const isDMGroup = useMemo(() => {
		return isDM && currenChannel?.user_id?.length > 1
	}, [isDM, currenChannel?.user_id])

	const stackUsers = useMemo(() => {
		const username = currenChannel?.category_name?.split(",");
		return isDMGroup
			? currenChannel?.channel_avatar?.map((avatar) => {
				return ({
					avatarUrl: avatar,
					username: username?.shift() || "Anonymous"
				})
			})
			: []
	}, [isDMGroup, currenChannel?.user_id])

	const creatorUser = useAppSelector(selectMemberClanByUserId(currenChannel?.creator_id));

	return (
		<View style={[
			styles.wrapperWelcomeMessage,
			isDMGroup && styles.wrapperCenter
		]}>
			{isDM ?
				isDMGroup
					? <MezonAvatar
						height={50}
						width={50}
						avatarUrl={""}
						username={""}
						stacks={stackUsers}
					/>
					: <MezonAvatar
						height={100}
						width={100}
						avatarUrl={currenChannel?.channel_avatar[0]}
						username={currenChannel?.usernames}
					/>
				: <View style={styles.iconWelcomeMessage}>
					{isChannel ? (
						<Icons.TextIcon width={50} height={50} color={themeValue.textStrong} />
					) : (
						<Icons.ThreadIcon width={50} height={50} color={themeValue.textStrong} />
					)}
				</View>
			}

			{isDM ? (
				<View>
					<Text style={styles.titleWelcomeMessage}>{currenChannel?.channel_label}</Text>
					{!isDMGroup && <Text style={styles.subTitleUsername}>{currenChannel?.usernames}</Text>}
					{currenChannel?.user_id?.length > 1
						? <Text style={styles.subTitleWelcomeMessageCenter}>{"Welcome to your new group! Invite friends whenever you're ready"}</Text>
						: <Text style={styles.subTitleWelcomeMessage}>{"This is the very beginning of your legendary conservation with " + currenChannel?.usernames}</Text>
					}

					{/* TODO: Mutual server */}
				</View>
			) : isChannel ? (
				<View>
					<Text style={styles.titleWelcomeMessage}>{'Welcome to #' + currenChannel?.channel_label}</Text>
					<Text style={styles.subTitleWelcomeMessage}>{'This is the start of the #' + currenChannel?.channel_label}</Text>
				</View>
			) : (
				<View>
					<Text style={styles.titleWelcomeMessage}>{currenChannel?.channel_label}</Text>
					<View style={{ flexDirection: "row" }}>
						<Text style={styles.subTitleWelcomeMessage}>{'Started by '}</Text>
						<Text style={styles.subTitleWelcomeMessageWithHighlight}>{creatorUser?.user?.username || "Anonymous"}</Text>
					</View>
				</View>
			)}
		</View>
	);
});

export default WelcomeMessage;
