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
	const { t, mentions = [], hashtags = [], emojis = [], markdowns = [], links = [], voicelinks = [] } = data;
	const elements = [...mentions, ...hashtags, ...emojis, ...markdowns, ...links, ...voicelinks].sort((a, b) => a.startindex - b.endindex);
	let lastindex = 0;
	const content = useMemo(() => {
		const formattedContent: React.ReactNode[] = [];

		elements.forEach((element, index) => {
			const { startindex, endindex, channelid, channellabel, username, userid, emojiid, shortname, markdown, link, voicelink } = element;

			if (lastindex < startindex) {
				formattedContent.push(
					<PlainText showOnchannelLayout={showOnchannelLayout} key={`plain-${lastindex}`} text={t.slice(lastindex, startindex)} />,
				);
			}

			if (channelid && channellabel) {
				formattedContent.push(
					<ChannelHashtag
						showOnchannelLayout={showOnchannelLayout}
						key={`${index}${startindex}${channelid}`}
						channelHastagId={`<#${channelid}>`}
					/>,
				);
			}
			if (username) {
				formattedContent.push(
					<MentionUser
						showOnchannelLayout={showOnchannelLayout}
						key={`${index}${startindex}${username}${userid}`}
						tagName={username}
						tagUserId={userid}
						mode={mode}
					/>,
				);
			}
			if (shortname) {
				formattedContent.push(
					<EmojiMarkup
						showOnChannelLayOut={showOnchannelLayout}
						key={`${index}${startindex}${shortname}`}
						emojiSyntax={shortname}
						onlyEmoji={false}
						emojiId={emojiid}
					/>,
				);
			}

			if (link && typeof link === 'string') {
				formattedContent.push(<MarkdownContent key={`${index}${startindex}${link as string}`} content={link as string} />);
			}

			if (voicelink && typeof voicelink === 'string') {
				const meetingCode = voicelink?.split('/').pop();
				const voiceChannelFound = allChannelVoice?.find((channel) => channel.meeting_code === meetingCode) || null;
				voiceChannelFound
					? formattedContent.push(
							<ChannelHashtag
								showOnchannelLayout={showOnchannelLayout}
								key={`${index}${startindex}${channelid}`}
								channelHastagId={`<#${voiceChannelFound?.channel_id}>`}
							/>,
						)
					: formattedContent.push(<MarkdownContent key={`${index}${startindex}${voicelink}`} content={voicelink as string} />);
			}

			if (markdown && typeof markdown === 'string') {
				const converted = markdown.startsWith('```') && markdown.endsWith('```') ? convertMarkdown(markdown) : markdown;
				formattedContent.push(<MarkdownContent key={`${index}${startindex}${markdown}`} content={converted as string} />);
			}
			lastindex = endindex;
		});

		if (lastindex < t?.length) {
			formattedContent.push(<PlainText showOnchannelLayout={showOnchannelLayout} key={`plain-${lastindex}-end`} text={t.slice(lastindex)} />);
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
