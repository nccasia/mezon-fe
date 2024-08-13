import { selectTheme } from '@mezon/store';
import clx from 'classnames';
import { memo, useCallback, useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { useSelector } from 'react-redux';
import remarkGfm from 'remark-gfm';
import { MessageImage, PreClass } from '../../components';

type MarkdownContentOpt = {
	content?: string;
	isJumMessageEnabled: boolean;
	isTokenClickAble: boolean;
	isRenderImage: boolean;
};

export const MarkdownContent: React.FC<MarkdownContentOpt> = ({ content, isJumMessageEnabled, isTokenClickAble, isRenderImage }) => {
	const appearanceTheme = useSelector(selectTheme);

	const [isImage, setIsImage] = useState<boolean>(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);

	// useEffect(() => {
	// 	if (content && isValidUrl(content)) {
	// 		handleUrlInput(content).then((result) => {
	// 			console.log(result);
	// 			if (result.filetype && result.filetype.startsWith(ETypeLinkMedia.IMAGE_PREFIX)) {
	// 				setTimeout(() => {
	// 					setIsImage(true);
	// 					setImageUrl(content);
	// 				}, 1000);
	// 			}
	// 		});
	// 	}
	// }, [content]);

	const onClickLink = useCallback(
		(url: string) => {
			if (!isJumMessageEnabled || isTokenClickAble) {
				window.open(url, '_blank');
			}
		},
		[isJumMessageEnabled, isTokenClickAble],
	);

	const classes = clx(
		'prose-code:text-sm inline prose-hr:my-0 prose-headings:my-0 prose-h1-2xl whitespace-pre-wrap prose   prose-blockquote:my-0 leading-[0] ',
		{
			lightMode: appearanceTheme === 'light',
		},
	);
	const [previewData, setPreviewData] = useState(null);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		// Fetches the link preview data when the URL prop changes
		const fetchData = async () => {
			try {
				const response = await fetch(content as string);
				const data = await response.text();
				console.log(data);
				// Parsing logic to extract link preview data goes here

				setLoading(false);
			} catch (error) {
				console.error(error);
				setLoading(false);
			}
		};

		fetchData();
	}, [content]);

	return (
		<article style={{ letterSpacing: '-0.01rem' }} className={classes}>
			<div className={`lineText contents dark:text-white text-colorTextLightMode ${isJumMessageEnabled ? 'whitespace-nowrap' : ''}`}>
				{isImage && imageUrl && isRenderImage ? (
					<MessageImage attachmentData={{ url: imageUrl }} />
				) : (
					<Markdown
						children={content}
						remarkPlugins={[remarkGfm]}
						components={{
							pre: PreClass,
							p: 'span',
							a: (props) => (
								<span
									onClick={() => onClickLink(props.href ?? '')}
									rel="noopener noreferrer"
									style={{
										color: 'rgb(59,130,246)',
										cursor: isJumMessageEnabled || !isTokenClickAble ? 'text' : 'pointer',
										wordBreak: 'break-word',
										textDecoration: isJumMessageEnabled || !isTokenClickAble ? 'none' : 'underline',
									}}
									className="tagLink"
								>
									{props.children}
								</span>
							),
						}}
					/>
				)}
			</div>
		</article>
	);
};
export default memo(MarkdownContent);
