import { memo, useCallback } from 'react';
import { ChannelHashtag, MentionUser, PreClass } from '../../components';

import React, { useEffect, useState } from 'react';

import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

type MessageLineProps = {
	line: string;
	messageId?: string;
	mode?: number;
	content?: any;
};

const MessageLine = ({ mode, content }: MessageLineProps) => {
	return (
		<div>
			<CustomMarkdown document={content.t} />
		</div>
	);
};

export default memo(MessageLine);

const preprocessMarkdown = (markdown: string) => {
	return markdown
		.replace(/@(\w+)/g, '<span class="mention" data-tagname="@$1">@$1</span>')
		.replace(/<#(\d+)>/g, '<span class="hashtag" data-tagname="<#$1>">#<$1></span>');
};

const CustomMarkdown: React.FC<{ document: string }> = ({ document }) => {
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
					article: (props) => (
						<article
							className="prose-code:text-sm inline prose-hr:my-0 prose-headings:my-0 prose-h1-2xl whitespace-pre-wrap prose  prose-blockquote:my-0 leading-[0]"
							{...props}
						/>
					),
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

	return <>{content}</>;
};
