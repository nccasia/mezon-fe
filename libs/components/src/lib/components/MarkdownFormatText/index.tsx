import { useApp, useEmojiSuggestion, useInvite } from '@mezon/core';
import { ILineMention, MentionTypeEnum, convertMarkdown, getSrcEmoji } from '@mezon/utils';
import Markdown from 'react-markdown';
import { useModal } from 'react-modal-hook';
import remarkGFM from 'remark-gfm';
import ExpiryTimeModal from '../ExpiryTime';
import ChannelHashtag from './HashTag';
import MentionUser from './MentionUser';
import PreClass from './PreClass';
import clx from 'classnames';

type MarkdownFormatTextProps = {
	mentions: ILineMention[];
	isOnlyEmoji: boolean;
};

const MarkdownFormatText = ({ mentions, isOnlyEmoji }: MarkdownFormatTextProps) => {
	const { getLinkInvite } = useInvite();
	const [openInviteChannelModal, closeInviteChannelModal] = useModal(() => <ExpiryTimeModal onClose={closeInviteChannelModal} open={true} />);
	const { appearanceTheme } = useApp();
	
	const getLinkinvite = (children: any) => {
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
	};

	const checkMention = (syntax: string) => {
		const isMention = syntax.startsWith('@');
		const isHashtag = syntax.startsWith('<#') && syntax.endsWith('>');
		const isEmojiSyntax = syntax.match(/:\b[^:]*\b:/g);
		if (isMention && !isHashtag && !isEmojiSyntax) {
			return MentionTypeEnum.MENTION;
		} else if (!isMention && isHashtag && !isEmojiSyntax) {
			return MentionTypeEnum.HASHTAG;
		} else {
			return MentionTypeEnum.EMOJI_SYNTAX;
		}
	};

	const classes = clx('prose-code:text-sm prose-hr:my-0 prose-headings:my-0 prose-headings:contents prose-h1:prose-2xl whitespace-pre-wrap prose prose-base prose-blockquote:leading-[6px] prose-blockquote:my-0 leading-[0]', {
		lightMode: appearanceTheme === 'light',
	});

	return (
		<article
			className={classes}
		>
			{mentions.map((part, index) => {
				const tagName = part.matchedText;
				const markdown = (part.nonMatchText && part.nonMatchText.trim()) ?? '';
				const startsWithTripleBackticks = markdown.startsWith('```');
				const endsWithNoTripleBackticks = !markdown.endsWith('```');
				const regexBetween3Backsticks = /```([\s\S]*?)```/g;
				const isBetween = regexBetween3Backsticks.test(markdown);
				const onlyBackticks = /^```$/.test(markdown);
				const result = convertMarkdown(markdown);

				return (
					<div key={index} className="lineText contents ">
						{mentions[index-1]?.matchedText && ' ' }
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
											onClick={() => getLinkinvite(children)}
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
						{tagName && ' '}
						{tagName && (
							<span className="">
								{checkMention(tagName) === MentionTypeEnum.MENTION ? (
									<MentionUser tagName={tagName} />
								) : checkMention(tagName) === MentionTypeEnum.HASHTAG ? (
									<ChannelHashtag channelHastagId={tagName} />
								) : (
									<EmojiMarkdown emojiSyntax={tagName} onlyEmoji={isOnlyEmoji} />
								)}
							</span>
						)}
					</div>
				);
			})}
		</article>
	);
};

export default MarkdownFormatText;

type EmojiMarkdownOpt = {
	emojiSyntax: string;
	onlyEmoji: boolean;
};

const EmojiMarkdown = ({ emojiSyntax, onlyEmoji }: EmojiMarkdownOpt) => {
	const { emojiListPNG } = useEmojiSuggestion();
	return (
		<span style={{ userSelect: 'none' }}>
			<img
				src={getSrcEmoji(emojiSyntax.trim(), emojiListPNG)}
				alt={getSrcEmoji(emojiSyntax.trim(), emojiListPNG)}
				className={`${onlyEmoji ? 'w-12' : 'w-6'}  h-auto inline-block relative -top-0.5 m-0`}
				onDragStart={(e) => e.preventDefault()}
			/>{' '}
		</span>
	);
};
