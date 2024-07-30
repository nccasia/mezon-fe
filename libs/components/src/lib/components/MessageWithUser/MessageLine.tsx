import { ChannelsEntity, selectChannelsEntities } from '@mezon/store';
import { convertMarkdown } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ChannelHashtag, EmojiMarkup, MarkdownContent, MentionUser, PlainText } from '../../components';

type MessageLineProps = {
	mode?: number;
	content?: any;
	showOnchannelLayout?: boolean;
	onClickToMessage?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};
interface RenderContentProps {
	data: any;
	mode: number;
	showOnchannelLayout?: boolean;
	allChannelVoice?: ChannelsEntity[];
}

// TODO: refactor component for message lines
const RenderContent = memo(({ data, mode, showOnchannelLayout, allChannelVoice }: RenderContentProps) => {
	const { t, mentions = [], hashtags = [], emojis = [], markdowns = [], links = [], voiceLinks = [] } = data;
	const elements = [...mentions, ...hashtags, ...emojis, ...markdowns, ...links, ...voiceLinks].sort((a, b) => a.startIndex - b.startIndex);
	let lastIndex = 0;
	const content = useMemo(() => {
		const formattedContent: React.ReactNode[] = [];

		elements.forEach((element, index) => {
			const { startIndex, endIndex, channelId, channelLabel, username, shortname, markdown, link, voiceLink } = element;

			if (lastIndex < startIndex) {
				formattedContent.push(
					<PlainText showOnchannelLayout={showOnchannelLayout} key={`plain-${lastIndex}`} text={t.slice(lastIndex, startIndex)} />,
				);
			}

			if (channelId && channelLabel) {
				formattedContent.push(
					<ChannelHashtag
						showOnchannelLayout={showOnchannelLayout}
						key={`${index}${startIndex}${channelId}`}
						channelHastagId={`<#${channelId}>`}
					/>,
				);
			}
			if (username) {
				formattedContent.push(
					<MentionUser showOnchannelLayout={showOnchannelLayout} key={`${index}${startIndex}${username}`} tagName={username} mode={mode} />,
				);
			}
			if (shortname) {
				formattedContent.push(<EmojiMarkup key={`${index}${startIndex}${shortname}`} emojiSyntax={shortname} onlyEmoji={false} />);
			}

			if (link) {
				formattedContent.push(<MarkdownContent key={`${index}${startIndex}${markdown}`} content={link} />);
			}

			if (voiceLink) {
				const meetingCode = voiceLink?.split('/').pop();
				const voiceChannelFound = allChannelVoice?.find((channel) => channel.meeting_code === meetingCode) || null;

				formattedContent.push(
					<ChannelHashtag
						showOnchannelLayout={showOnchannelLayout}
						key={`${index}${startIndex}${channelId}`}
						channelHastagId={`<#${voiceChannelFound?.channel_id}>`}
					/>,
				);
			}

			if (markdown) {
				const converted = markdown.startsWith('```') && markdown.endsWith('```') ? convertMarkdown(markdown) : markdown;
				formattedContent.push(<MarkdownContent key={`${index}${startIndex}${markdown}`} content={converted} />);
			}
			lastIndex = endIndex;
		});

		if (lastIndex < t?.length) {
			formattedContent.push(<PlainText showOnchannelLayout={showOnchannelLayout} key={`plain-${lastIndex}-end`} text={t.slice(lastIndex)} />);
		}

		return formattedContent;
	}, [elements, t, mode]);
	return <div>{content}</div>;
});

const MessageLine = ({ mode, content, showOnchannelLayout, onClickToMessage }: MessageLineProps) => {
	const allChannels = useSelector(selectChannelsEntities);
	const allChannelVoice = Object.values(allChannels).flat();

	return (
		<div onClick={!showOnchannelLayout ? onClickToMessage : () => {}} className={`${showOnchannelLayout ? '' : 'cursor-pointer'}`}>
			<RenderContent
				data={content}
				mode={mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL}
				showOnchannelLayout={showOnchannelLayout}
				allChannelVoice={allChannelVoice}
			/>
		</div>
	);
};

export default memo(MessageLine);
