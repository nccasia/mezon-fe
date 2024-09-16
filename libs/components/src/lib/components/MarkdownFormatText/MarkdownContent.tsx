import { useAppNavigation } from '@mezon/core';
import { inviteActions, selectTheme, useAppDispatch } from '@mezon/store';
import clx from 'classnames';
import { memo, useCallback } from 'react';
import Markdown from 'react-markdown';
import { useSelector } from 'react-redux';
import remarkGfm from 'remark-gfm';
import { PreClass } from '../../components';

type MarkdownContentOpt = {
	content?: string;
	isJumMessageEnabled: boolean;
	isTokenClickAble: boolean;
};

const navigateToChannel = async (url: string, navigate: any) => {
	const regex = /\/invite\/(\d+)/;
	const match = url.match(regex);
	if (match) {
		const [_, inviteId] = match;
		if (inviteId) {
			navigate('/invite/' + inviteId);
		}
	}
};

export const MarkdownContent: React.FC<MarkdownContentOpt> = ({ content, isJumMessageEnabled, isTokenClickAble }) => {
	const appearanceTheme = useSelector(selectTheme);
	const { navigate } = useAppNavigation();
	const dispatch = useAppDispatch();
	const origin = process.env.NX_CHAT_APP_REDIRECT_URI + '/invite/';

	const onClickLink = useCallback(
		(url: string) => {
			if (!isJumMessageEnabled || isTokenClickAble) {
				if (url.startsWith(origin)) {
					const urlInvite = new URL(url);
					dispatch(inviteActions.setIsClickInvite(true));
					navigate(urlInvite.pathname);
				} else {
					window.open(url, '_blank');
				}
			}
		},
		[isJumMessageEnabled, isTokenClickAble]
	);

	const classes = clx(
		'prose-code:text-sm inline prose-hr:my-0 prose-headings:my-0 prose-h1-2xl whitespace-pre-wrap prose   prose-blockquote:my-0 leading-[0] ',
		{
			lightMode: appearanceTheme === 'light'
		}
	);

	return (
		<article style={{ letterSpacing: '-0.01rem' }} className={classes}>
			<div className={`lineText contents dark:text-white text-colorTextLightMode ${isJumMessageEnabled ? 'whitespace-nowrap' : ''}`}>
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
									textDecoration: isJumMessageEnabled || !isTokenClickAble ? 'none' : 'underline'
								}}
								className="tagLink"
							>
								{props.children}
							</span>
						)
					}}
				/>
			</div>
		</article>
	);
};
export default memo(MarkdownContent);
