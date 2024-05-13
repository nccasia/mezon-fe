import { Metrics } from '@mezon/mobile-ui';
import { selectMemberByUserId } from '@mezon/store';
import {
	IChannelMember,
	IMessageWithUser,
	convertTimeString,
	notImplementForGifOrStickerSendFromPanel,
	getTimeDifferenceInSeconds, TIME_COMBINE, checkSameDay
} from '@mezon/utils';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, {useEffect, useMemo, useState} from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import ImageView from 'react-native-image-viewing';
import VideoPlayer from 'react-native-video-player';
import { useSelector } from 'react-redux';
import { useMessageParser } from '../../../hooks/useMessageParser';
import { mentionRegex, mentionRegexSplit, urlPattern, validURL } from '../../../utils/helpers';
import { FastImageRes } from './Reusables';
import { styles } from './styles';

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
};
const MessageItem = React.memo((props: MessageItemProps) => {
	const { attachments, lines } = useMessageParser(props.message);
	const user = useSelector(selectMemberByUserId(props?.message?.sender_id));
	const [videos, setVideos] = useState<ApiMessageAttachment[]>([]);
	const [images, setImages] = useState<ApiMessageAttachment[]>([]);
	const [visibleImage, setIsVisibleImage] = useState<boolean>(false);
	const [documents, setDocuments] = useState<ApiMessageAttachment[]>([]);
	const [calcImgHeight, setCalcImgHeight] = useState<number>(180);

	// TODO: add logic here
	const isCombine = true;
	
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
			<View>
				{videos.map((video, index) => {
					return (
						<VideoPlayer
							isControlsVisible={false}
							disableFullscreen={false}
							video={{ uri: video?.url }}
							videoWidth={widthMedia}
							videoHeight={150}
							style={{
								width: widthMedia,
							}}
							thumbnail={{ uri: video?.url }}
						/>
					);
				})}
			</View>
		);
	};

	const renderImages = () => {
		return (
			<View>
				{images.map((image, index) => {
					const checkImage = notImplementForGifOrStickerSendFromPanel(image);

					return (
						<TouchableOpacity activeOpacity={0.8} onPress={() => setIsVisibleImage(true)}>
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
				})}
			</View>
		);
	};

	const renderDocuments = () => {
		return documents.map((document, index) => {
			return <View />;
		});
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
			alert('mention' + mention);
		} catch (error) {
			console.log('error', error);
		}
	};

	const renderTextWithLinks = (text: string, matches: RegExpMatchArray) => {
		const parts = text.split(urlPattern);
		return parts.map((part, index) => {
			if (!part) return <View />;
			return (
				<Text
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					onTouchEnd={() => {
						if (matches.includes(part)) {
							onOpenLink(part);
						}
					}}
					key={index}
					style={matches.includes(part) ? styles.contentMessageLink : styles.contentMessageBox}
				>
					{part}
				</Text>
			);
		});
	};

	const renderTextWithMention = (text: string, matchesMention: RegExpMatchArray) => {
		const parts = text
			.split(mentionRegexSplit)
			.filter(Boolean)
			.filter((i) => i !== '@' && i !== '#');

		return parts.map((part, index) => {
			if (!part) return <View />;
			return (
				<Text
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					onTouchEnd={() => {
						if (matchesMention.includes(part)) {
							onMention(part);
						}
					}}
					key={index}
					style={matchesMention.includes(part) ? styles.contentMessageMention : styles.contentMessageBox}
				>
					{part}
				</Text>
			);
		});
	};

	const renderTextContent = () => {
		const isLinkPreview = validURL(lines);

		const matchesMention = lines.match(mentionRegex);
		if (matchesMention?.length) {
			return <Text>{renderTextWithMention(lines, matchesMention)}</Text>;
		}
		const matches = lines.match(urlPattern);
		if (isLinkPreview) {
			return <Text>{renderTextWithLinks(lines, matches)}</Text>;
		}
		return <Text style={styles.contentMessageBox}>{lines}</Text>;
	};

	return (
		<View style={[styles.wrapperMessageBox, !isCombine && styles.wrapperMessageBoxCombine]}>
			<View style={{ width: 40, height: 40, borderRadius: 50, overflow: 'hidden' }}>
				{isCombine &&
					(user?.user?.avatar_url ? (
						<FastImageRes uri={user?.user?.avatar_url} />
					) : (
						<View style={styles.avatarMessageBoxDefault}>
							<Text style={styles.textAvatarMessageBoxDefault}>{user?.user?.username?.charAt(0)?.toUpperCase()}</Text>
						</View>
					))}
			</View>
			<View style={styles.rowMessageBox}>
				{isCombine && (
					<View style={styles.messageBoxTop}>
						<Text style={styles.userNameMessageBox}>{user?.user?.username}</Text>
						<Text style={styles.dateMessageBox}>{convertTimeString(props?.message?.create_time)}</Text>
					</View>
				)}
				{videos.length > 0 && renderVideos()}
				{images.length > 0 && renderImages()}
				{images.length > 0 && (
					<ImageView
						images={images.map((i) => {
							return { uri: i.url };
						})}
						imageIndex={0}
						visible={visibleImage}
						onRequestClose={() => setIsVisibleImage(false)}
					/>
				)}
				{documents.length > 0 && renderDocuments()}
				{renderTextContent()}
			</View>
		</View>
	);
});

export default MessageItem;
