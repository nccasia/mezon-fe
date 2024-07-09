import React from 'react';
import { useChannelMembers } from "@mezon/core";
import { Pressable, TouchableOpacity, View } from "react-native";
import { Text } from 'react-native';
import { ScrollView } from "react-native-gesture-handler";
import MemberItem from "./MemberItem";
import style from "./style";
import { AddMemberIcon, AngleRightIcon, ChevronIcon, UserGroupIcon } from "@mezon/mobile-components";
import { useContext, useMemo, useState, useRef, useCallback } from "react";
import { threadDetailContext } from "../ThreadDetail/MenuThreadDetail";
import { ChannelType } from "mezon-js";
import { UserInformationBottomSheet } from "../UserInformationBottomSheet";
import { ChannelMembersEntity } from "@mezon/utils";
import { useNavigation } from "@react-navigation/native";
import { APP_SCREEN } from "../../navigation/ScreenTypes";
import { useTranslation } from "react-i18next";
import { DirectEntity } from '@mezon/store-mobile';
import { InviteToChannel } from '../../screens/home/homedrawer/components/InviteToChannel';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

enum EActionButton {
	AddMembers = 'Add Members',
	InviteMembers = 'Invite Members',
}

export const MemberListStatus = React.memo(() => {
    const currentChannel = useContext(threadDetailContext);
    const navigation = useNavigation<any>();
    const { onlineMembers, offlineMembers } = useChannelMembers({ channelId: currentChannel?.id });
    const [ selectedUser, setSelectedUser ] = useState<ChannelMembersEntity | null>(null);
    const { t } = useTranslation();
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	const isDMThread = useMemo(() => {
		return [ChannelType.CHANNEL_TYPE_DM, ChannelType.CHANNEL_TYPE_GROUP].includes(currentChannel?.type);
	}, [currentChannel]);
	const handleAddOrInviteMembers = useCallback((action: EActionButton) => {
		if (action === EActionButton.InviteMembers) bottomSheetRef?.current?.present();
	}, []);

	const navigateToNewGroupScreen = () => {
		navigation.navigate(APP_SCREEN.MESSAGES.STACK, { screen: APP_SCREEN.MESSAGES.NEW_GROUP, params: { directMessage: currentChannel as DirectEntity } });
	};

	return (
		<ScrollView contentContainerStyle={style.container}>
			{currentChannel?.type === ChannelType.CHANNEL_TYPE_DM ? (
                <TouchableOpacity onPress={() => navigateToNewGroupScreen()} style={style.actionItem}>
                    <View style={[style.actionIconWrapper]}>
                        <UserGroupIcon />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={style.actionTitle}>{t('message:newMessage.newGroup')}</Text>
                        <Text style={style.newGroupContent} numberOfLines={1}>{t('message:newMessage.createGroupWith')} {currentChannel?.channel_label}</Text>
                    </View>
                    <ChevronIcon height={15} width={15} />
                </TouchableOpacity>
            ): null}

			{currentChannel?.channel_avatar?.length !== 1 ? (
				<Pressable
					onPress={() => {
						handleAddOrInviteMembers(isDMThread ? EActionButton.AddMembers : EActionButton.InviteMembers);
					}}
				>
					<View style={style.inviteBtn}>
						<View style={style.iconNameWrapper}>
							<View style={style.iconWrapper}>
								<AddMemberIcon height={16} width={16} />
							</View>
							<Text style={style.text}>{isDMThread ? EActionButton.AddMembers : EActionButton.InviteMembers}</Text>
						</View>
						<View>
							<AngleRightIcon height={22} width={22} />
						</View>
					</View>
				</Pressable>
			) : null}

			<View>
				{onlineMembers?.length > 0 && (
					<View>
						<Text style={style.text}>Member - {onlineMembers?.length || '0'}</Text>
						<View style={style.box}>
							{onlineMembers.map((user) => (
								<MemberItem
									onPress={(user) => {
										setSelectedUser(user);
									}}
									user={user}
									key={user?.user?.id}
                  currentChannel={currentChannel}
                  isDMThread={isDMThread}
								/>
							))}
						</View>
					</View>
				)}
				{offlineMembers?.length > 0 && (
					<View style={{ marginTop: 20 }}>
						<Text style={style.text}>Offline - {offlineMembers?.length}</Text>
						<View style={style.box}>
							{offlineMembers.map((user) => (
								<MemberItem
									key={user.id}
									user={user}
									isOffline={true}
									onPress={(user) => {
										setSelectedUser(user);
									}}
                  currentChannel={currentChannel}
                  isDMThread={isDMThread}
								/>
							))}
						</View>
					</View>
				)}
			</View>
			<UserInformationBottomSheet userId={selectedUser?.user?.id} onClose={() => setSelectedUser(null)} />
			<InviteToChannel isUnknownChannel={false} ref={bottomSheetRef} />
		</ScrollView>
	);
})
