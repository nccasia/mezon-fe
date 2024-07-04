import { useEmojiSuggestion, useInvite } from '@mezon/core';
import { selectTheme } from '@mezon/store';
import { ILineMention, MentionTypeEnum, convertMarkdown, getSrcEmoji } from '@mezon/utils';
import clx from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import remarkGFM from 'remark-gfm';
import ExpiryTimeModal from '../ExpiryTime';
import ChannelHashtag from './HashTag';
import MentionUser from './MentionUser';
import PreClass from './PreClass';

type MarkdownFormatTextProps = {
	mentions: ILineMention[];
	isOnlyEmoji: boolean;
	mode?: number;
};

const MarkdownFormatText: React.FC<MarkdownFormatTextProps> = ({ mentions, isOnlyEmoji, mode }) => {
	// TODO: move the invitation logic to upper level
	const { getLinkInvite } = useInvite();

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
							window.location.href = children;
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
		'prose-code:text-sm prose-hr:my-0 prose-headings:my-0 prose-headings:contents prose-h1:prose-2xl whitespace-pre-wrap prose prose-base prose-blockquote:leading-[6px] prose-blockquote:my-0 leading-[0]',
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
				<div key={index} className="lineText contents ">
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
								a: ({ children }) => (
									<span
										onClick={() => getLinkinvites(children)}
										rel="noopener noreferrer"
										style={{ color: 'rgb(59,130,246)', cursor: 'pointer' }}
										className="tagLink"
									>
										{children}
									</span>
								),
							}}
						/>
					)}
					{tagName && (
						<span className="">
							{isMention ? (
								<>
								<MentionUser tagName={tagName} mode={mode}/>{' '}
							</>
							) : isHashtag ? (
								<>
									<ChannelHashtag channelHastagId={tagName} />{' '}
								</>
							) : isEmojiSyntax ? (
								<>
									<EmojiMarkdown emojiSyntax={tagName} onlyEmoji={isOnlyEmoji} />{' '}
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

	return <article className={classes}>{memoizedMentions}</article>;
};

export default MarkdownFormatText;

type EmojiMarkdownOpt = {
	emojiSyntax: string;
	onlyEmoji: boolean;
	posReply?: boolean;
};

export const EmojiMarkdown: React.FC<EmojiMarkdownOpt> = ({ emojiSyntax, onlyEmoji, posReply }) => {
	const { emojis } = useEmojiSuggestion();
	const [className, setClassName] = useState<string>(`${onlyEmoji ? 'w-12' : 'w-6'}  h-auto inline-block relative -top-0.5 m-0`);

	useEffect(() => {
		if (posReply) {
			setClassName(`w-4 h-auto inline-block relative -top-0.5 m-0`);
		}
	}, [posReply]);

	const srcEmoji = getSrcEmoji(emojiSyntax.trim(), emojis);

	return (
		<span style={{ userSelect: 'none' }}>
			<img src={srcEmoji} alt={srcEmoji} className={className} onDragStart={(e) => e.preventDefault()} />
		</span>
	);
};
