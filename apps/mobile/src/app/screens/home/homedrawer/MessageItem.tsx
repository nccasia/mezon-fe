import { useAuth, useClans, useDeleteMessage } from '@mezon/core';
import { FileIcon, HashSignIcon, ReplyIcon, STORAGE_KEY_CHANNEL_ID, STORAGE_KEY_CLAN_ID, SpeakerIcon, save } from '@mezon/mobile-components';
import { Colors, Metrics, size, verticalScale } from '@mezon/mobile-ui';
import { ChannelsEntity, channelsActions, getStoreAsync, messagesActions, selectChannelById, selectEmojiImage, selectMemberByUserId, selectMessageByMessageId, useAppDispatch } from '@mezon/store-mobile';
import {
	EmojiDataOptionals,
	IChannelMember,
	IMessageWithUser,
	TIME_COMBINE,
	checkSameDay,
	convertTimeString,
	getSrcEmoji,
	getTimeDifferenceInSeconds,
	notImplementForGifOrStickerSendFromPanel,
} from '@mezon/utils';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Pressable, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Hyperlink } from 'react-native-hyperlink';
import VideoPlayer from 'react-native-video-player';
import { useSelector } from 'react-redux';
import { useMessageParser } from '../../../hooks/useMessageParser';
import { isImage, mentionRegex, mentionRegexSplit } from '../../../utils/helpers';
import { MessageAction, MessageItemBS } from './components';
import { EMessageBSToShow } from './enums';
import { styles } from './styles';
import { setSelectedMessage } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { useTranslation } from 'react-i18next';
import { ChannelType } from 'mezon-js';
import Toast from 'react-native-toast-message';

const widthMedia = Metrics.screenWidth - 150;
export type MessageItemProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	user?: IChannelMember | null;
	isMessNotifyMention?: boolean;
	mode: number;
	newMessage?: string;
	child?: JSX.Element;
	isMention?: boolean;
	channelLabel?: string;
	channelId?: string;
	dataReactionCombine?: EmojiDataOptionals[];
	onOpenImage?: (image: ApiMessageAttachment) => void;
};

const arePropsEqual = (prevProps, nextProps) => {
	return prevProps.message === nextProps.message && prevProps.dataReactionCombine === nextProps.dataReactionCombine;
};

const MessageItem = React.memo((props: MessageItemProps) => {
	const { message, mode, dataReactionCombine, preMessage, onOpenImage } = props;
	const userLogin = useAuth();
	const dispatch = useAppDispatch();
	const [foundUser, setFoundUser] = useState(null);
	const { attachments, lines } = useMessageParser(props.message);
	const user = useSelector(selectMemberByUserId(props?.message?.sender_id));
	const [videos, setVideos] = useState<ApiMessageAttachment[]>([]);
	const [images, setImages] = useState<ApiMessageAttachment[]>([]);
	const [documents, setDocuments] = useState<ApiMessageAttachment[]>([]);
	const [calcImgHeight, setCalcImgHeight] = useState<number>(180);
	const [openBottomSheet, setOpenBottomSheet] = useState<EMessageBSToShow | null>(null);
	const [isOnlyEmojiPicker, setIsOnlyEmojiPicker] = useState<boolean>(false);
	const messageRefFetchFromServe = useSelector(selectMessageByMessageId(props.message?.references[0]?.message_ref_id || ''));
	const repliedSender = useSelector(selectMemberByUserId(messageRefFetchFromServe?.user?.id || ''));
	const emojiListPNG = useSelector(selectEmojiImage);
	const { DeleteSendMessage } = useDeleteMessage({ channelId: props.channelId, channelLabel: props.channelLabel, mode: props.mode });
	const hasIncludeMention = message.content.t?.includes('@here') || message.content.t?.includes(`@${userLogin.userProfile?.user?.username}`);
	const { usersClan } = useClans();
	const { t } = useTranslation('message');
	const isCombine = useMemo(() => {
		const timeDiff = getTimeDifferenceInSeconds(preMessage?.create_time as string, message?.create_time as string);
		return (
			timeDiff < TIME_COMBINE &&
			preMessage?.user?.id === message?.user?.id &&
			checkSameDay(preMessage?.create_time as string, message?.create_time as string)
		);
	}, [message, preMessage]);
	const isShowInfoUser = useMemo(() => !isCombine || (message.references.length && !!user), [isCombine, message.references, user]);

	const classifyAttachments = (attachments: ApiMessageAttachment[]) => {
		const videos: ApiMessageAttachment[] = [];
		const images: ApiMessageAttachment[] = [];
		const documents: ApiMessageAttachment[] = [];

		attachments.forEach((attachment) => {
			if (attachment.filetype?.indexOf('video/mp4') !== -1 && !attachment.url?.includes('tenor.com')) {
				videos.push(attachment);
			} else if (attachment.filetype?.indexOf('image/png') !== -1 || attachment.filetype?.indexOf('image/jpeg') !== -1) {
				images.push(attachment);
			} else {
				documents.push(attachment);
			}
		});

		return { videos, images, documents };
	};

	useEffect(() => {
		const { videos, images, documents } = classifyAttachments(attachments ?? []);
		setVideos(videos);
		setImages(images);
		setDocuments(documents);
	}, [attachments]);

	const renderVideos = () => {
		return (
			<View
				style={{
					width: widthMedia + size.s_50,
					marginVertical: size.s_10,
				}}
			>
				{videos.map((video, index) => {
					return (
						<VideoPlayer
							key={`${video?.url}_${index}`}
							isControlsVisible={false}
							disableFullscreen={false}
							video={{ uri: video?.url }}
							videoWidth={widthMedia + size.s_50}
							videoHeight={160}
							hideControlsOnStart={true}
							resizeMode="cover"
							style={{
								width: widthMedia + size.s_50,
								height: 160,
								borderRadius: size.s_4,
								overflow: 'hidden',
								backgroundColor: Colors.borderDim,
							}}
							endWithThumbnail={true}
							thumbnail={{ uri: 'https://www.keytechinc.com/wp-content/uploads/2022/01/video-thumbnail.jpg' }}
						/>
					);
				})}
			</View>
		);
	};

	const imageItem = ({ image, index, checkImage }) => {
		return (
			<TouchableOpacity
				disabled={checkImage}
				activeOpacity={0.8}
				key={index}
				onPress={() => {
					onOpenImage(image);
				}}
			>
				<FastImage
					style={[
						styles.imageMessageRender,
						{
							width: widthMedia,
							height: calcImgHeight,
						},
					]}
					source={{ uri: image?.url }}
					resizeMode="contain"
					onLoad={(evt) => {
						setCalcImgHeight((evt.nativeEvent.height / evt.nativeEvent.width) * widthMedia);
					}}
				/>
			</TouchableOpacity>
		);
	};

	const renderImages = () => {
		return (
			<View>
				{images.map((image, index) => {
					const checkImage = notImplementForGifOrStickerSendFromPanel(image);

					return imageItem({ image, index, checkImage });
				})}
			</View>
		);
	};

	const renderDocuments = () => {
		return documents.map((document, index) => {
			const checkIsImage = isImage(document?.url);
			if (checkIsImage) {
				return imageItem({ image: document, index, checkImage: checkIsImage });
			}

			return (
				<TouchableOpacity activeOpacity={0.8} key={index} onPress={() => onOpenDocument(document)}>
					<View style={styles.fileViewer}>
						<FileIcon width={verticalScale(30)} height={verticalScale(30)} color={Colors.bgViolet} />
						<View style={{ maxWidth: '75%' }}>
							<Text style={styles.fileName} numberOfLines={2}>
								{document.filename}
							</Text>
						</View>
					</View>
				</TouchableOpacity>
			);
		});
	};

	const onOpenDocument = async (document: ApiMessageAttachment) => {
		await Linking.openURL(document.url);
		try {
			await Linking.openURL(document.url);
		} catch (error) {
			console.log('OpenDocument error', error);
		}
	};

	const onOpenLink = async (link: string) => {
		try {
			await Linking.openURL(link);
		} catch (error) {
			const googleSearchURL = `https://${encodeURIComponent(link)}`;
			await Linking.openURL(googleSearchURL);
		}
	};

	const onMention = async (mention: string) => {
		try {
			const tagName = mention.slice(1);
			const userMention = usersClan?.find(userClan => userClan?.user?.username === tagName)
			userMention && setFoundUser(userMention)
			if (!mention) return;
			setMessageSelected(EMessageBSToShow.UserInformation);
		} catch (error) {
			console.log('error', error);
		}
	};

	const jumpToChannel = async (channelId: string, clanId: string) => {
		const store = await getStoreAsync();

		store.dispatch(messagesActions.jumpToMessage({ messageId: '', channelId: channelId }));
		store.dispatch(channelsActions.joinChannel({
			clanId: clanId ?? '',
			channelId: channelId,
			noFetchMembers: false
		}));
	};

	const onChannelMention = async (channel: ChannelsEntity) => {
		try {
			const type = channel?.type;
			const channelId = channel?.channel_id;
			const clanId = channel?.clan_id;

			if (type === ChannelType.CHANNEL_TYPE_VOICE) {
				Toast.show({
					type: "info",
					text1: "Updating...",
				})
			} else if (type === ChannelType.CHANNEL_TYPE_TEXT) {
				save(STORAGE_KEY_CHANNEL_ID, channelId);
				save(STORAGE_KEY_CLAN_ID, clanId);
				console.log(channelId);
				console.log(clanId);

				await jumpToChannel(channelId, clanId);
			}
		} catch (error) {
			console.log(error);
		}
	}

	const getChannelById = (channelHashtagId: string) => {
		const channel = useSelector(selectChannelById(channelHashtagId));
		return channel;
	};


	const renderChannelMention = (id: string) => {
		const channel = getChannelById(id.slice(1));
		const type = channel?.type;

		return (
			<Text style={styles.mentionWrapper}>
				<Text
					onPress={() => onChannelMention(channel)}
					style={styles.contentMessageMention}
				>
					{type === ChannelType.CHANNEL_TYPE_VOICE
						? <Text><SpeakerIcon height={12} width={12} /> </Text>
						// : <HashSignIcon height={16} width={16} />
						: "#"}
					{channel?.channel_label || ""}
				</Text>
			</Text>

		)
	}

	const renderUserMention = (id: string) => {
		return (
			<Text style={styles.mentionWrapper}>
				<Text
					onPress={() => onMention(id)}
					style={styles.contentMessageMention}
				>
					{id}
				</Text>
			</Text>
		)
	}

	const renderMention = (id: string) => {
		return id.startsWith("@")
			? <Text>{renderUserMention(id)} </Text>
			: id.startsWith("#")
				? <Text>{renderChannelMention(id)} </Text>
				: <Text />
	}

	const renderTextWithMention = (text: string, matchesMention: RegExpMatchArray) => {
		const parts = text
			.split(mentionRegexSplit)
			.filter(Boolean)
			.filter((i) => i !== '@' && i !== '#');

		return parts.map((part, index) => (
			<Text key={`${index}-${part}-renderTextWithMention'}`}>
				{!part
					? <Text />
					: matchesMention.includes(part)
						? renderMention(part)
						: <Text style={styles.contentMessageBox}>
							{renderTextWithEmoji(part)}
						</Text>
				}
			</Text>
		));
	};

	const renderTextContent = () => {
		if (!lines) return null;
		const matchesMention = lines.match(mentionRegex);

		return (
			<Hyperlink linkStyle={styles.contentMessageLink} onPress={(url) => onOpenLink(url)}>
				{matchesMention?.length ? (
					<Text style={[isCombine && styles.contentMessageCombine]}>
						{renderTextWithMention(lines, matchesMention)}
						{isEdited ? (
					<Text style={styles.editedText}>{t('edited')}</Text>
				): null}
					</Text>
				) : (
					<Text style={[styles.contentMessageBox, isCombine && styles.contentMessageCombine]}>
						{renderTextWithEmoji(lines)}
						{isEdited ? (
					<Text style={styles.editedText}>{t('edited')}</Text>
				): null}
					</Text>
				)}
			</Hyperlink>
		);
	};

	const renderTextWithEmoji = (text: string) => {
		const splitTextMarkdown = text?.trim()?.split?.(' ');

		return (
			<Text>
				{splitTextMarkdown.map((item, index) => {
					const srcEmoji = getSrcEmoji(item, emojiListPNG || []);
					const regex = /:\b[^:]*\b:/g;
					if (item.match(regex) && srcEmoji) {
						return (
							<Text key={`${index}-${srcEmoji}-renderTextWithEmoji`}>
								{' '}
								<FastImage key={index} source={{ uri: srcEmoji }} style={styles.iconEmojiInMessage} resizeMode={'contain'} />{' '}
							</Text>
						);
					}
					return <Text key={`${index}-${item}-renderTextWithEmoji`}>{item} </Text>;
				})}
			</Text>
		);
	};
	const onConfirmDeleteMessage = () => {
		DeleteSendMessage(props.message.id);
	};

	const setMessageSelected = (type: EMessageBSToShow) => {
		setOpenBottomSheet(type);
	};

	const jumpToRepliedMesage = () => {
		console.log('message to jump', messageRefFetchFromServe);
	};

	const isEdited = useMemo(() => {
		if (message?.update_time) {
			const updateDate = new Date(message?.update_time);
			const createDate = new Date(message?.create_time);
			return updateDate > createDate;
		}
		return false;
	}, [message])

	return (
		<View style={[styles.messageWrapper, isCombine && { marginTop: 0 }, hasIncludeMention && styles.highlightMessageMention]}>
			{messageRefFetchFromServe ? (
				<View style={styles.aboveMessage}>
					<View style={styles.iconReply}>
						<ReplyIcon width={34} height={30} />
					</View>
					<Pressable onPress={() => jumpToRepliedMesage()} style={styles.repliedMessageWrapper}>
						{repliedSender?.user?.avatar_url ? (
							<View style={styles.replyAvatar}>
								<Image source={{ uri: repliedSender?.user?.avatar_url }} style={styles.replyAvatar} />
							</View>
						) : (
							<View style={[styles.replyAvatar]}>
								<View style={styles.avatarMessageBoxDefault}>
									<Text style={styles.repliedTextAvatar}>{repliedSender?.user?.username?.charAt(0)?.toUpperCase()}</Text>
								</View>
							</View>
						)}
						<Text style={styles.repliedContentText} numberOfLines={1}>
							{messageRefFetchFromServe.content.t}
						</Text>
					</Pressable>
				</View>
			) : null}
			<View style={[styles.wrapperMessageBox, !isCombine && styles.wrapperMessageBoxCombine]}>
				{isShowInfoUser ? (
					<Pressable
						onPress={() => {
							setIsOnlyEmojiPicker(false);
							setMessageSelected(EMessageBSToShow.UserInformation);
							setFoundUser(user);
						}}
						style={styles.wrapperAvatar}
					>
						{user?.user?.avatar_url ? (
							<Image source={{ uri: user?.user?.avatar_url }} style={styles.logoUser} />
						) : (
							<View style={styles.avatarMessageBoxDefault}>
								<Text style={styles.textAvatarMessageBoxDefault}>{user?.user?.username?.charAt(0)?.toUpperCase()}</Text>
							</View>
						)}
					</Pressable>
				) : (
					<View style={styles.wrapperAvatarCombine} />
				)}
				<Pressable
					style={[styles.rowMessageBox]}
					onLongPress={() => {
						setIsOnlyEmojiPicker(false);
						setMessageSelected(EMessageBSToShow.MessageAction);
						dispatch(setSelectedMessage(message));
					}}
				>
					{isShowInfoUser ? (
						<TouchableOpacity
							activeOpacity={0.8}
							onPress={() => {
								setIsOnlyEmojiPicker(false);
								setMessageSelected(EMessageBSToShow.UserInformation);
								setFoundUser(user)
							}}
							style={styles.messageBoxTop}
						>
							<Text style={styles.userNameMessageBox}>{user?.user?.username}</Text>
							<Text style={styles.dateMessageBox}>{convertTimeString(props?.message?.create_time)}</Text>
						</TouchableOpacity>
					) : null}
					{videos.length > 0 && renderVideos()}
					{images.length > 0 && renderImages()}

					{documents.length > 0 && renderDocuments()}
					{renderTextContent()}
					<MessageAction
						message={message}
						dataReactionCombine={dataReactionCombine}
						mode={mode}
						emojiListPNG={emojiListPNG}
						openEmojiPicker={() => {
							setIsOnlyEmojiPicker(true);
							setMessageSelected(EMessageBSToShow.MessageAction);
						}}
					/>
				</Pressable>
			</View>
			<MessageItemBS
				mode={mode}
				message={message}
				onConfirmDeleteMessage={onConfirmDeleteMessage}
				type={openBottomSheet}
				isOnlyEmojiPicker={isOnlyEmojiPicker}
				onClose={() => {
					setOpenBottomSheet(null);
				}}
				user={foundUser}
			/>
		</View>
	);
}, arePropsEqual);

export default MessageItem;
