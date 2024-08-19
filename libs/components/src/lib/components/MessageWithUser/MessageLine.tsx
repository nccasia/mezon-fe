import { ChannelsEntity, selectChannelsEntities } from '@mezon/store';
import { ETokenMessage, IExtendedMessage } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChannelHashtag, EmojiMarkup, MarkdownContent, MentionUser, PlainText } from '../../components';

type MessageLineProps = {
	mode?: number;
	content?: IExtendedMessage;
	onClickToMessage?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	isOnlyContainEmoji?: boolean;
	isSearchMessage?: boolean;
	isHideLinkOneImage?: boolean;
	isJumMessageEnabled: boolean;
	isTokenClickAble: boolean;
};

const MessageLine = ({
	mode,
	content,
	isJumMessageEnabled,
	onClickToMessage,
	isOnlyContainEmoji,
	isSearchMessage,
	isTokenClickAble,
	isHideLinkOneImage,
}: MessageLineProps) => {
	const allChannels = useSelector(selectChannelsEntities);
	const allChannelVoice = Object.values(allChannels).flat();
	const [maxWidth, setMaxWidth] = useState(window.innerWidth - 600);

	useEffect(() => {
		const handleResize = () => {
			setMaxWidth(window.innerWidth - 600);
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
	return (
		<div onClick={isJumMessageEnabled ? onClickToMessage : () => {}} className={`${!isJumMessageEnabled ? '' : 'cursor-pointer'} `}>
			<RenderContent
				isHideLinkOneImage={isHideLinkOneImage}
				isTokenClickAble={isTokenClickAble}
				isOnlyContainEmoji={isOnlyContainEmoji}
				isJumMessageEnabled={isJumMessageEnabled}
				data={content as IExtendedMessage}
				mode={mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL}
				allChannelVoice={allChannelVoice}
				isSearchMessage={isSearchMessage}
				parentWidth={maxWidth}
			/>
		</div>
	);
};

export default memo(MessageLine);

interface RenderContentProps {
	data: IExtendedMessage;
	mode: number;
	allChannelVoice?: ChannelsEntity[];
	isOnlyContainEmoji?: boolean;
	isSearchMessage?: boolean;
	isHideLinkOneImage?: boolean;
	isTokenClickAble: boolean;
	isJumMessageEnabled: boolean;
	parentWidth?: number;
}

interface ElementToken {
	s?: number;
	e?: number;
	kindOf: ETokenMessage;
	user_id?: string;
	role_id?: string;
	channelid?: string;
	emojiid?: string;
}

const RenderContent = memo(
	({
		data,
		mode,
		allChannelVoice,
		isSearchMessage,
		isJumMessageEnabled,
		parentWidth,
		isOnlyContainEmoji,
		isTokenClickAble,
		isHideLinkOneImage,
	}: RenderContentProps) => {
		const { t, mentions = [], hg = [], ej = [], mk = [], lk = [], vk = [] } = data;
		const elements: ElementToken[] = [
			...mentions.map((item) => ({ ...item, kindOf: ETokenMessage.MENTIONS })),
			...hg.map((item) => ({ ...item, kindOf: ETokenMessage.HASHTAGS })),
			...ej.map((item) => ({ ...item, kindOf: ETokenMessage.EMOJIS })),
			...mk.map((item) => ({ ...item, kindOf: ETokenMessage.MARKDOWNS })),
			...lk.map((item) => ({ ...item, kindOf: ETokenMessage.LINKS })),
			...vk.map((item) => ({ ...item, kindOf: ETokenMessage.VOICE_LINKS })),
		].sort((a, b) => (a.s ?? 0) - (b.s ?? 0));

		let lastindex = 0;
		const content = useMemo(() => {
			const formattedContent: React.ReactNode[] = [];

			elements.forEach((element, index) => {
				const s = element.s ?? 0;
				const e = element.e ?? 0;

				let contentInElement = t?.substring(s, e);

				if (lastindex < s) {
					formattedContent.push(
						<PlainText isSearchMessage={isSearchMessage} key={`plain-${lastindex}`} text={t?.slice(lastindex, s) ?? ''} />,
					);
				}

				if (element.kindOf === ETokenMessage.HASHTAGS) {
					formattedContent.push(
						<ChannelHashtag
							isTokenClickAble={isTokenClickAble}
							isJumMessageEnabled={isJumMessageEnabled}
							key={`hashtag-${index}-${s}-${element.channelid}`}
							channelHastagId={`<#${element.channelid}>`}
						/>,
					);
				}

				if (element.kindOf === ETokenMessage.MENTIONS) {
					formattedContent.push(
						<MentionUser
							isTokenClickAble={isTokenClickAble}
							isJumMessageEnabled={isJumMessageEnabled}
							key={`mentionUser-${index}-${s}-${contentInElement}-${element.user_id}-${element.role_id}`}
							tagName={contentInElement ?? ''}
							tagUserId={element.user_id ? element.user_id : (element.role_id ?? '')}
							mode={mode}
						/>,
					);
				}

				if (element.kindOf === ETokenMessage.EMOJIS) {
					formattedContent.push(
						<EmojiMarkup
							key={`emoji-${index}-${s}-${element.emojiid}`}
							emojiSyntax={contentInElement ?? ''}
							onlyEmoji={isOnlyContainEmoji ?? false}
							emojiId={element.emojiid ?? ''}
						/>,
					);
				}

				if (element.kindOf === ETokenMessage.LINKS && !isHideLinkOneImage) {
					formattedContent.push(
						<MarkdownContent
							isTokenClickAble={isTokenClickAble}
							isJumMessageEnabled={isJumMessageEnabled}
							key={`link-${index}-${s}-${contentInElement}`}
							content={contentInElement}
						/>,
					);
				}

				if (element.kindOf === ETokenMessage.VOICE_LINKS) {
					const meetingCode = contentInElement?.split('/').pop();
					const voiceChannelFound = allChannelVoice?.find((channel) => channel.meeting_code === meetingCode) || null;
					voiceChannelFound
						? formattedContent.push(
								<ChannelHashtag
									isTokenClickAble={isTokenClickAble}
									isJumMessageEnabled={isJumMessageEnabled}
									key={`voicelink-${index}-${s}-${voiceChannelFound?.channel_id}`}
									channelHastagId={`<#${voiceChannelFound?.channel_id}>`}
								/>,
							)
						: formattedContent.push(
								<MarkdownContent
									isTokenClickAble={isTokenClickAble}
									isJumMessageEnabled={isJumMessageEnabled}
									key={`voicelink-${index}-${s}-${contentInElement}`}
									content={contentInElement}
								/>,
							);
				}

				if (element.kindOf === ETokenMessage.MARKDOWNS) {
					if (isJumMessageEnabled) {
						let replacement;
						while (contentInElement?.includes('```')) {
							replacement = contentInElement.indexOf('```');
							contentInElement = contentInElement.slice(0, replacement) + '`' + contentInElement.slice(replacement + 3);
						}
					}

					formattedContent.push(
						<MarkdownContent
							isTokenClickAble={isTokenClickAble}
							isJumMessageEnabled={isJumMessageEnabled}
							key={`markdown-${index}-${s}-${contentInElement}`}
							content={contentInElement}
						/>,
					);
				}

				lastindex = e;
			});

			if (t && lastindex < t?.length) {
				formattedContent.push(<PlainText isSearchMessage={isSearchMessage} key={`plain-${lastindex}-end`} text={t.slice(lastindex)} />);
			}

			return formattedContent;
		}, [elements, t, mode]);

		return (
			<div
				style={
					isJumMessageEnabled
						? {
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								maxWidth: parentWidth,
							}
						: undefined
				}
				className={`${isJumMessageEnabled ? 'whitespace-pre-line gap-1 hover:text-[#060607] hover:dark:text-[#E6F3F5] text-[#4E5057] dark:text-[#B4BAC0] flex items-center  cursor-pointer' : 'text-[#4E5057] dark:text-[#DFDFE0]'}`}
			>
				{content}
			</div>
		);
	},
);
