import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ChannelHashtag, EmojiMarkup, MarkdownContent, MentionUser, PlainText, PreClass } from '../../components';

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

const MessageLine = ({ mode, content, showOnchannelLayout, onClickToMessage }: MessageLineProps) => {
	return (
		<div onClick={!showOnchannelLayout ? onClickToMessage : () => {}} className={`${showOnchannelLayout ? '' : 'cursor-pointer'}`}>
			{/* <RenderContent data={content} mode={mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL} showOnchannelLayout={showOnchannelLayout} /> */}
			<FormattedMessageLine document={content.t}></FormattedMessageLine>
		</div>
	);
};

export default memo(MessageLine);

const preprocessMarkdown = (markdown: string) => {
	return markdown
		.replace(/@(\w+)/g, '<span class="mention" data-tagname="@$1">@$1</span>')
		.replace(/<#(\d+)>/g, '<span class="hashtag" data-tagname="<#$1>">#<$1></span>');
};

const FormattedMessageLine: React.FC<{ document: string }> = ({ document }) => {
	const [content, setContent] = useState<React.ReactNode>(null);
	const processedDocument = preprocessMarkdown(document);

	const onClickLink = useCallback((url: string) => {
		window.open(url, '_blank');
	}, []);

	useEffect(() => {
		// Process Markdown content with plugins
		setContent(
			<Markdown
				children={processedDocument}
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={{
					p: (props) => <p {...props} />,
					span: (props) => {
						const { className, ...rest } = props as { className?: string; 'data-tagname'?: string };
						if (className === 'mention' && rest['data-tagname']) {
							return <MentionUser tagName={rest['data-tagname']} />;
						}
						if (className === 'hashtag' && rest['data-tagname']) {
							return <ChannelHashtag channelHastagId={rest['data-tagname']} />;
						}
					},
					pre: PreClass,
					a: (props) => (
						<span
							onClick={() => onClickLink(props.href ?? '')}
							rel="noopener noreferrer"
							style={{ color: 'rgb(59,130,246)', cursor: 'pointer' }}
							className="tagLink"
						>
							{props.children}
						</span>
					),
				}}
			/>,
		);
	}, [document]);

	// className="prose-code:text-sm inline prose-hr:my-0 prose-headings:my-0 prose-h1-2xl whitespace-pre-wrap prose  prose-blockquote:my-0 leading-[0]"
	return <article className=" prose">{content}</article>;
};

const RenderContent = memo(({ data, mode, showOnchannelLayout }: RenderContentProps) => {
	const { t, mentions = [], hashtags = [], emojis = [], links = [], markdowns = [] } = data;
	const elements = [...mentions, ...hashtags, ...emojis, ...links, ...markdowns].sort((a, b) => a.startIndex - b.startIndex);
	let lastIndex = 0;
	const content = useMemo(() => {
		const formattedContent: React.ReactNode[] = [];

		elements.forEach((element, index) => {
			const { startIndex, endIndex, channelId, channelLable, username, shortname, markdown, link } = element;

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
			lastIndex = endIndex;
		});

		if (lastIndex < t?.length) {
			formattedContent.push(<PlainText showOnchannelLayout={showOnchannelLayout} key={`plain-${lastIndex}-end`} text={t.slice(lastIndex)} />);
		}

		return formattedContent;
	}, [elements, t, mode]);
	return <div>{content}</div>;
});
