import { useAppNavigation, useEmojiSuggestion, useInvite } from '@mezon/core';
import { selectTheme } from '@mezon/store';
import { ILineMention, MentionTypeEnum, convertMarkdown, getSrcEmoji } from '@mezon/utils';
import clx from 'classnames';
import isElectron from 'is-electron';
import React, { useCallback, useMemo } from 'react';
import Markdown from 'react-markdown';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import remarkGFM from 'remark-gfm';
import ExpiryTimeModal from '../ExpiryTime';
import EmojiMarkdown from './EmojiMarkup';
import ChannelHashtag from './HashTag';
import MentionUser from './MentionUser';
import PreClass from './PreClass';

type MarkdownFormatTextProps = {
	mentions: ILineMention[];
	isOnlyEmoji: boolean;
	mode?: number;
	lengthLine?: number;
};

const MarkdownFormatText: React.FC<MarkdownFormatTextProps> = ({ mentions, isOnlyEmoji, mode, lengthLine }) => {
	// TODO: move the invitation logic to upper level
	const { getLinkInvite } = useInvite();
	const { navigate } = useAppNavigation();

	const [openInviteChannelModal, closeInviteChannelModal] = useModal(() => <ExpiryTimeModal onClose={closeInviteChannelModal} open={true} />);

	const appearanceTheme = useSelector(selectTheme);

	const { emojis } = useEmojiSuggestion();

	// TODO: move the invitation logic to upper level
	const getLinkinvites = useCallback(
		(children: any) => {
			const inviteId = children.split('/invite/')[1];
			if (inviteId) {
				getLinkInvite(inviteId).then((res) => {
					if (res.expiry_time) {
						if (new Date(res.expiry_time) < new Date()) {
							openInviteChannelModal();
						} else {
							if (isElectron()) {
								navigate('/invite/' + inviteId);
							} else {
								window.location.href = children;
							}
						}
					}
				});
			} else {
				window.open(children, '_blank');
			}
		},
		[getLinkInvite, openInviteChannelModal],
	);

	const checkMention = (syntax: string) => {
		const isMention = syntax.startsWith('@');
		const isHashtag = syntax.startsWith('<#') && syntax.endsWith('>');
		const isEmojiSyntax = syntax.match(/:\b[^:]*\b:/g);

		const srcEmoji = getSrcEmoji(syntax.trim(), emojis);

		if (isMention && !isHashtag && !isEmojiSyntax) {
			return MentionTypeEnum.MENTION;
		} else if (!isMention && isHashtag && !isEmojiSyntax) {
			return MentionTypeEnum.HASHTAG;
		} else if (isEmojiSyntax && srcEmoji !== undefined) {
			return MentionTypeEnum.EMOJI_SYNTAX;
		}
	};

	const classes = clx(
		'prose-code:text-sm prose-hr:my-0 prose-headings:my-0 prose-h1-2xl whitespace-pre-wrap prose   prose-blockquote:my-0 leading-[0] ',

		{
			lightMode: appearanceTheme === 'light',
		},
	);

	const memoizedMentions = useMemo(() => {
		return mentions.map((part, index) => {
			const tagName = part.matchedText;
			const markdown = (part.nonMatchText && part.nonMatchText.trim()) ?? '';
			const startsWithTripleBackticks = markdown.startsWith('```');
			const endsWithNoTripleBackticks = !markdown.endsWith('```');
			const regexBetween3Backsticks = /```([\s\S]*?)```/g;
			const isBetween = regexBetween3Backsticks.test(markdown);
			const onlyBackticks = /^```$/.test(markdown);

			const isMention = checkMention(tagName) === MentionTypeEnum.MENTION;
			const isHashtag = checkMention(tagName) === MentionTypeEnum.HASHTAG;
			const isEmojiSyntax = checkMention(tagName) === MentionTypeEnum.EMOJI_SYNTAX;
			const result = convertMarkdown(markdown);

			return (
				<div key={index} className="lineText contents dark:text-white text-colorTextLightMode">
					{mentions[index - 1]?.matchedText && ''}
					{(startsWithTripleBackticks && endsWithNoTripleBackticks && !isBetween) || onlyBackticks ? (
						<span>{markdown}</span>
					) : (
						<Markdown
							children={startsWithTripleBackticks && !endsWithNoTripleBackticks ? result : markdown}
							remarkPlugins={[remarkGFM]}
							components={{
								pre: PreClass,
								p: 'span',
								a: (props) => (
									<span
										onClick={() => getLinkinvites(props.href)}
										rel="noopener noreferrer"
										style={{ color: 'rgb(59,130,246)', cursor: 'pointer' }}
										className="tagLink"
									>
										{props.children}
									</span>
								),

								th: ({ node, ...props }) => (
									<th
										style={{
											padding: '12px 15px',
											border: '1px solid #ddd',
											color: '#fff',
										}}
										{...props}
									/>
								),
								td: ({ node, ...props }) => (
									<td
										style={{
											padding: '12px 15px',
											border: '1px solid #ddd',
											color: '#ddd',
										}}
										{...props}
									/>
								),
							}}
						/>
					)}
					{tagName && (
						<span>
							{isMention ? (
								<>
									{part.startIndex === 0 ? '' : ' '}
									<MentionUser tagName={tagName} mode={mode} />
									{part.endIndex === lengthLine ? '' : ' '}
								</>
							) : isHashtag ? (
								<>
									{part.startIndex === 0 ? '' : ' '}
									<ChannelHashtag channelHastagId={tagName} />
									{part.endIndex === lengthLine ? '' : ' '}
								</>
							) : isEmojiSyntax ? (
								<>
									{part.startIndex === 0 ? '' : ' '}
									<EmojiMarkdown emojiSyntax={tagName} onlyEmoji={isOnlyEmoji} />
									{part.endIndex === lengthLine ? '' : ' '}
								</>
							) : (
								tagName
							)}
						</span>
					)}
				</div>
			);
		});
	}, [mentions, getLinkinvites, isOnlyEmoji]);

	return (
		<article style={{ letterSpacing: '-0.01rem' }} className={classes}>
			{memoizedMentions}
		</article>
	);
};

export default MarkdownFormatText;
