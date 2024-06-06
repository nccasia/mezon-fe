 import  React, { useEffect, useState } from 'react';
import { IMessageNotifyProps } from '../types';
import { View , Text, Linking} from 'react-native';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import FastImage from 'react-native-fast-image';
 import ImageView from 'react-native-image-view';
import VideoPlayer from 'react-native-video-player';
import { Metrics } from '@mezon/mobile-ui';
import { styles as s } from './MessageNotification.styles';
import { useMessageParser } from '../../../hooks/useMessageParser';
import { mentionRegex, mentionRegexSplit, urlPattern, validURL } from '../../../utils/helpers';
const MessageNotification = React.memo((messageProps: IMessageNotifyProps)=>{
  const widthMedia = Metrics.screenWidth - 150;
  const { message , newMessage} = messageProps;
  const { attachments } = useMessageParser(message);
	const [videos, setVideos] = useState<ApiMessageAttachment[]>([]);
	const [images, setImages] = useState<ApiMessageAttachment[]>([]);
	const [documents, setDocuments] = useState<ApiMessageAttachment[]>([]);
  const [visibleImage, setIsVisibleImage] = useState<boolean>(false);


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
							key={index}
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
					return (
							<FastImage
								key={index}
								style={[
									s.imageMessageRender,
								]}
								source={{ uri: image?.url }}
								resizeMode="contain"
							/>
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
					style={matches.includes(part) ? s.contentMessageLink : s.contentMessageBox}
				>
					{part}
				</Text>
			);
		});
	};

  const onMention = async (mention: string) => {
		try {
			alert('mention' + mention);
		} catch (error) {
			console.log('error', error);
		}
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
					style={matchesMention.includes(part) ? s.contentMessageMention : s.contentMessageBox}
				>
					{part}
				</Text>
			);
		});
	};

  const renderTextContent = () => {
		const isLinkPreview = validURL(newMessage);

		const matchesMention = newMessage.match(mentionRegex);
		if (matchesMention?.length) {
			return <Text>{renderTextWithMention(newMessage, matchesMention)}</Text>;
		}
		const matches = newMessage.match(urlPattern);
		if (isLinkPreview) {
			return <Text>{renderTextWithLinks(newMessage, matches)}</Text>;
		}
		return <Text style={s.contentMessageBox}>{newMessage}</Text>;
	};


  return (
    <View style={[s.wrapperMessageBox]}>
      	{videos.length > 0 && renderVideos()}
				{images.length > 0 && renderImages()}
				{images.length > 0 && (
					<ImageView
						animationType={'none'}
						images={images.map((i) => {
							return { uri: i.url };
						})}
						imageIndex={0}
						isVisible={visibleImage}
						glideAlways
						isSwipeCloseEnabled
						isPinchZoomEnabled
						isTapZoomEnabled
						controls={{
							next: true,
							prev: true,
							close: true,
						}}
						renderFooter={() => setIsVisibleImage(false)}
					/>
				)}
				{documents.length > 0 && renderDocuments()}
				{renderTextContent()}
    </View>
  )
})

export default MessageNotification;
