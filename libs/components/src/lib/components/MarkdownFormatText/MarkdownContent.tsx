import { selectTheme } from '@mezon/store';
import clx from 'classnames';
import { memo, useCallback } from 'react';
import Markdown from 'react-markdown';
import { useSelector } from 'react-redux';
import remarkGfm from 'remark-gfm';
import { PreClass } from '../../components';

type MarkdownContentOpt = {
	content?: string;
};

export const MarkdownContent: React.FC<MarkdownContentOpt> = ({ content }) => {
	const appearanceTheme = useSelector(selectTheme);

	const onClickLink = useCallback((url: string) => {
		window.open(url, '_blank');
	}, []);

	const classes = clx(
		'prose-code:text-sm inline prose-hr:my-0 prose-headings:my-0 prose-h1-2xl whitespace-pre-wrap prose   prose-blockquote:my-0 leading-[0] ',
		{
			lightMode: appearanceTheme === 'light',
		},
	);

	return (
		<>
			<article style={{ letterSpacing: '-0.01rem' }} className={classes}>
				<div className="lineText contents dark:text-white text-colorTextLightMode">
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
									style={{ color: 'rgb(59,130,246)', cursor: 'pointer' }}
									className="tagLink"
								>
									{props.children}
								</span>
							),
						}}
					/>
				</div>
			</article>
		</>
	);
};
export default memo(MarkdownContent);
