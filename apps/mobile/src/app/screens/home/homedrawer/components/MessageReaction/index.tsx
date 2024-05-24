import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { IDetailReactionBottomSheet, IMessageReactionProps } from "../../types";
import { useChatReaction } from "@mezon/core";
import { EmojiDataOptionals, SenderInfoOptionals, calculateTotalCount } from "@mezon/utils";
import { styles } from "./styles";
import { FaceIcon } from "@mezon/mobile-components";
import { Colors } from "@mezon/mobile-ui";
import BottomSheet from 'react-native-raw-bottom-sheet';
import { ScrollView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import { selectMemberByUserId } from "@mezon/store";
import { FastImageRes } from "../../Reusables";
import { ChannelStreamMode } from "mezon-js";

export const MessageAction = React.memo((props: IMessageReactionProps) => {
    const { message, dataReactionCombine } = props || {};
    const [currentEmojiSelectedId, setCurrentEmojiSelectedId] = useState<string|null>(null);
    const {
		userId,
        reactionMessageDispatch
	} = useChatReaction();

    const openEmojiPicker = () => {
        console.log('open emoji picker');
    }

    const reactOnExistEmoji = async (
		id: string,
		mode: number,
		messageId: string,
		emoji: string,
		count: number,
		message_sender_id: string,
		action_delete?: boolean,
	) => {
		await reactionMessageDispatch(id, mode ?? 2, messageId ?? '', emoji ?? '', 1, message_sender_id ?? '', false);
	}

    return (
        <View style={styles.reactionWrapper}>
            {(dataReactionCombine || []).filter((emoji: EmojiDataOptionals) => emoji.message_id === message.id).map((emojiItemData: EmojiDataOptionals, index) => {
                    const userSender = emojiItemData.senders.find((sender: SenderInfoOptionals) => sender.sender_id === userId);
                    const isMyReaction = userSender?.count && userSender.count > 0;
                    return (
                        <Pressable
                            onLongPress={() => setCurrentEmojiSelectedId(emojiItemData.id)}
                            onPress={() => reactOnExistEmoji(
                                emojiItemData.id ?? '',
                                ChannelStreamMode.STREAM_MODE_CHANNEL,
                                message.id ?? '',
                                emojiItemData.emoji ?? '',
                                1,
                                userId ?? '',
                                false,
                            )}
                            key={index + emojiItemData.id}
                            style={[styles.reactItem, isMyReaction ? styles.myReaction : styles.otherReaction]}
                        >
                            <Text style={styles.originEmojiColor}>{emojiItemData.emoji}</Text>
                            <Text style={styles.reactCount}>{calculateTotalCount(emojiItemData.senders)}</Text>
                        </Pressable>
                    )
                })
            }

            {(dataReactionCombine || []).filter((emoji: EmojiDataOptionals) => emoji.message_id === message.id).length ? (
                <Pressable onPress={() => openEmojiPicker()} style={styles.addEmojiIcon}>
                    <FaceIcon color={Colors.bgCharcoal} />
                </Pressable>
            ): null}

            <ReactionDetail allReactionDataOnOneMessage={(dataReactionCombine || []).filter((emoji: EmojiDataOptionals) => emoji.message_id === message.id)} emojiSelectedId={currentEmojiSelectedId} onClose={() => setCurrentEmojiSelectedId(null)} />
        </View>
    )
})

const ReactionDetail = React.memo((props: IDetailReactionBottomSheet) => {
    const { emojiSelectedId, onClose, allReactionDataOnOneMessage } = props;
    const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
    const ref = useRef(null);

    const getTabHeader = () => {
        return allReactionDataOnOneMessage.map((emojiItem) => {
            return (
                <Pressable
                    key={emojiItem.id}
                    onPress={() => setSelectedTabId(emojiItem.id)}
                    style={[styles.tabHeaderItem, selectedTabId === emojiItem.id && styles.activeTab]}
                >
                    <Text style={[styles.emojiTab, styles.originEmojiColor]}>{emojiItem.emoji}</Text>
                    <Text style={[styles.reactCount, styles.headerTabCount]}>{calculateTotalCount(emojiItem.senders)}</Text>
                </Pressable>
            )
        });
    }

    const getContent = () => {
        return <View style={styles.contentWrapper}>
            {allReactionDataOnOneMessage.filter((item) => item.id === selectedTabId)
                .map(data => data.senders)
                .flat(1)
                .map((user) => {
                    return (
                        <View key={user.sender_id}>
                            <MemberReact userId={user.sender_id} />
                        </View>
                    )
                })
            }
        </View>
    }

    useEffect(() => {
        if (ref) {
            if (emojiSelectedId !== null) {
                ref.current?.open();
                setSelectedTabId(emojiSelectedId);
            } else {
                ref.current?.close();
                setSelectedTabId(null);
            }
        }
    }, [emojiSelectedId])

    return (
        <BottomSheet
            ref={ref}
            height={500}
            onClose={() => onClose()}
            draggable
            customStyles={{
                container: {
                    backgroundColor: 'transparent'
                }
            }}
        >
            <View style={styles.bottomSheetWrapper}>
                <View style={styles.contentHeader}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabHeaderWrapper}>
                            {getTabHeader()}
                    </ScrollView>
                </View>
                <View>
                    {getContent()}
                </View>
            </View>
        </BottomSheet>
    )
})

const MemberReact = React.memo((props: {userId: string}) => {
	const user = useSelector(selectMemberByUserId(props.userId || ''));

    const openMemberDetail = () => {
        //TODO: update later
        console.log(user);
    }

    return (
        <Pressable style={styles.memberWrapper} onPress={() => openMemberDetail()}>
            <View
                style={styles.imageWrapper}
            >
                {user?.user?.avatar_url ? (
                    <FastImageRes uri={user?.user?.avatar_url} />
                ) : (
                    <View style={styles.avatarBoxDefault}>
                        <Text style={styles.textAvatarBoxDefault}>{user?.user?.username?.charAt(0)?.toUpperCase()}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.memberName}>{user.user.display_name}</Text>
            <Text style={styles.mentionText}>@{user.user.username}</Text>
        </Pressable>
    )
})
