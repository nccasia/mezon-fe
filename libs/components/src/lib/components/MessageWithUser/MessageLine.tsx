// eslint-disable-next-line @nx/enforce-module-boundaries
import { ChannelsEntity, selectChannelsEntities } from '@mezon/store';
import { EMarkdownType, ETokenMessage, IExtendedMessage, convertMarkdown } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ChannelHashtag, EmojiMarkup, MarkdownContent, MentionUser, PlainText, useMessageContextMenu } from '../../components';

type MessageLineProps = {
	mode?: number;
	content?: IExtendedMessage;
	onClickToMessage?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	isOnlyContainEmoji?: boolean;
	isSearchMessage?: boolean;
	isHideLinkOneImage?: boolean;
	isJumMessageEnabled: boolean;
	isTokenClickAble: boolean;
	isEditted: boolean;
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
	isEditted
}: MessageLineProps) => {
	const allChannels = useSelector(selectChannelsEntities);
	const allChannelVoice = Object.values(allChannels).flat();
	return (
		<div
			onClick={
				isJumMessageEnabled
					? onClickToMessage
					: () => {
							// eslint-disable-next-line @typescript-eslint/no-empty-function
						}
			}
			className={`${!isJumMessageEnabled ? '' : 'cursor-pointer'} `}
		>
			<RenderContent
				isHideLinkOneImage={isHideLinkOneImage}
				isTokenClickAble={isTokenClickAble}
				isOnlyContainEmoji={isOnlyContainEmoji}
				isJumMessageEnabled={isJumMessageEnabled}
				data={content as IExtendedMessage}
				mode={mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL}
				allChannelVoice={allChannelVoice}
				isSearchMessage={isSearchMessage}
				isEditted={isEditted}
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
	isEditted: boolean;
}

interface ElementToken {
	s?: number;
	e?: number;
	kindOf: ETokenMessage;
	user_id?: string;
	role_id?: string;
	channelid?: string;
	emojiid?: string;
	type?: EMarkdownType;
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
		isEditted
	}: RenderContentProps) => {
		const { t, mentions = [], hg = [], ej = [], mk = [], lk = [], vk = [] } = data;
		const hgm = Array.isArray(hg) ? hg.map((item) => ({ ...item, kindOf: ETokenMessage.HASHTAGS })) : [];
		const ejm = Array.isArray(ej) ? ej.map((item) => ({ ...item, kindOf: ETokenMessage.EMOJIS })) : [];
		const mkm = Array.isArray(mk) ? mk.map((item) => ({ ...item, kindOf: ETokenMessage.MARKDOWNS })) : [];
		const lkm = Array.isArray(lk) ? lk.map((item) => ({ ...item, kindOf: ETokenMessage.LINKS })) : [];
		const vkm = Array.isArray(vk) ? vk.map((item) => ({ ...item, kindOf: ETokenMessage.VOICE_LINKS })) : [];
		const elements: ElementToken[] = [
			...mentions.map((item) => ({ ...item, kindOf: ETokenMessage.MENTIONS })),
			...hgm,
			...ejm,
			...mkm,
			...lkm,
			...vkm
		].sort((a, b) => (a.s ?? 0) - (b.s ?? 0));
		const { allUserIdsInChannel, allRolesInClan } = useMessageContextMenu();

		let lastindex = 0;
		const content = useMemo(() => {
			const formattedContent: React.ReactNode[] = [];

			elements.forEach((element, index) => {
				const s = element.s ?? 0;
				const e = element.e ?? 0;

				const contentInElement = t?.substring(s, e);

				if (lastindex < s) {
					formattedContent.push(
						<PlainText isSearchMessage={isSearchMessage} key={`plain-${lastindex}`} text={t?.slice(lastindex, s) ?? ''} />
					);
				}

				if (element.kindOf === ETokenMessage.HASHTAGS) {
					formattedContent.push(
						<ChannelHashtag
							isTokenClickAble={isTokenClickAble}
							isJumMessageEnabled={isJumMessageEnabled}
							key={`hashtag-${index}-${s}-${element.channelid}`}
							channelHastagId={`<#${element.channelid}>`}
						/>
					);
				}

				if (element.kindOf === ETokenMessage.MENTIONS && element.user_id) {
					if (allUserIdsInChannel.indexOf(element.user_id) !== -1) {
						formattedContent.push(
							<MentionUser
								isTokenClickAble={isTokenClickAble}
								isJumMessageEnabled={isJumMessageEnabled}
								key={`mentionUser-${index}-${s}-${contentInElement}-${element.user_id}-${element.role_id}`}
								tagUserName={contentInElement ?? ''}
								tagUserId={element.user_id}
								mode={mode}
							/>
						);
					} else {
						formattedContent.push(
							<PlainText
								isSearchMessage={false}
								key={`userDeleted-${index}-${s}-${contentInElement}-${element.user_id}-${element.role_id}`}
								text={contentInElement ?? ''}
							/>
						);
					}
				}
				if (element.kindOf === ETokenMessage.MENTIONS && element.role_id) {
					if (allRolesInClan.indexOf(element.role_id) !== -1) {
						formattedContent.push(
							<MentionUser
								isTokenClickAble={isTokenClickAble}
								isJumMessageEnabled={isJumMessageEnabled}
								key={`roleMention-${index}-${s}-${contentInElement}-${element.user_id}-${element.role_id}`}
								tagRoleName={contentInElement ?? ''}
								tagRoleId={element.role_id}
								mode={mode}
							/>
						);
					} else {
						formattedContent.push(
							<PlainText
								isSearchMessage={false}
								key={`roleDeleted-${index}-${s}-${contentInElement}-${element.user_id}-${element.role_id}`}
								text={contentInElement ?? ''}
							/>
						);
					}
				}
				if (element.kindOf === ETokenMessage.EMOJIS) {
					formattedContent.push(
						<EmojiMarkup
							isOne={Number(t?.length) - 1 === Number(element?.e) - Number(element.s) ? true : false}
							key={`emoji-${index}-${s}-${element.emojiid}`}
							emojiSyntax={contentInElement ?? ''}
							onlyEmoji={isOnlyContainEmoji ?? false}
							emojiId={element.emojiid ?? ''}
						/>
					);
				}

				if (element.kindOf === ETokenMessage.LINKS && !isHideLinkOneImage) {
					formattedContent.push(
						<MarkdownContent
							isTokenClickAble={isTokenClickAble}
							isJumMessageEnabled={isJumMessageEnabled}
							key={`link-${index}-${s}-${contentInElement}`}
							content={contentInElement}
						/>
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
								/>
							)
						: formattedContent.push(
								<MarkdownContent
									isTokenClickAble={isTokenClickAble}
									isJumMessageEnabled={isJumMessageEnabled}
									key={`voicelink-${index}-${s}-${contentInElement}`}
									content={contentInElement}
								/>
							);
				}

				if (element.kindOf === ETokenMessage.MARKDOWNS) {
					let content = contentInElement ?? '';

					if (isJumMessageEnabled) {
						content = content.replace(/\n/g, '');

						if (element.type === EMarkdownType.TRIPLE) {
							content = content.replace(/```/g, '`');
						}
					} else {
						content = convertMarkdown(content);
					}
					formattedContent.push(
						<MarkdownContent
							isTokenClickAble={isTokenClickAble}
							isJumMessageEnabled={isJumMessageEnabled}
							key={`markdown-${index}-${s}-${contentInElement}`}
							content={content}
						/>
					);
				}

				lastindex = e;
			});

			if (t && lastindex < t?.length) {
				formattedContent.push(<PlainText isSearchMessage={isSearchMessage} key={`plain-${lastindex}-end`} text={t.slice(lastindex)} />);
			}

			if (isEditted) {
				formattedContent.push(
					<p
						key={`edited-status-${lastindex}-end`}
						className="ml-[5px] inline opacity-50 text-[9px] self-center font-semibold dark:text-textDarkTheme text-textLightTheme w-[50px]"
					>
						(edited)
					</p>
				);
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
								textOverflow: 'ellipsis'
							}
						: {
								whiteSpace: 'pre-line'
							}
				}
				className={`${isJumMessageEnabled ? 'whitespace-pre-line gap-1 hover:text-[#060607] hover:dark:text-[#E6F3F5] text-[#4E5057] dark:text-[#B4BAC0] flex items-center  cursor-pointer' : 'text-[#4E5057] dark:text-[#DFDFE0]'}`}
			>
				{content}
			</div>
		);
	}
);
