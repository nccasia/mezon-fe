import { ChannelStreamMode } from 'mezon-js';
import { memo, useMemo } from 'react';
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
}

// TODO: refactor component for message lines
const RenderContent = memo(({ data, mode, showOnchannelLayout }: RenderContentProps) => {
	const { t, mentions = [], hashtags = [], emojis = [], links = [], markdowns = [] } = data;
	const elements = [...mentions, ...hashtags, ...emojis, ...links, ...markdowns].sort((a, b) => a.startIndex - b.startIndex);
	let lastIndex = 0;
	const maxEndIndex = elements.reduce((max, element) => (element.endIndex > max ? element.endIndex : max), 0);

	const content = useMemo(() => {
		const formattedContent: React.ReactNode[] = [];

		elements.forEach((element, index) => {
			const { startIndex, endIndex, channelId, channelLable, username, shortname, link, markdown } = element;

			if (lastIndex < startIndex) {
				formattedContent.push(
					<PlainText showOnchannelLayout={showOnchannelLayout} key={`plain-${lastIndex}`} text={t.slice(lastIndex, startIndex)} />,
				);
			}

			if (channelId && channelLable) {
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

			if (markdown || link) {
				formattedContent.push(<MarkdownContent key={`${index}${startIndex}${markdown}`} content={markdown} />);
			}
			lastIndex = maxEndIndex;
		});

		if (lastIndex < t?.length) {
			formattedContent.push(<PlainText showOnchannelLayout={showOnchannelLayout} key={`plain-${lastIndex}-end`} text={t.slice(lastIndex)} />);
		}

		return formattedContent;
	}, [elements, t, mode]);
	return <div>{content}</div>;
});

const MessageLine = ({ mode, content, showOnchannelLayout, onClickToMessage }: MessageLineProps) => {
	return (
		<div onClick={!showOnchannelLayout ? onClickToMessage : () => {}} className={`${showOnchannelLayout ? '' : 'cursor-pointer'}`}>
			<RenderContent data={content} mode={mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL} showOnchannelLayout={showOnchannelLayout} />
		</div>
	);
};

export default memo(MessageLine);
