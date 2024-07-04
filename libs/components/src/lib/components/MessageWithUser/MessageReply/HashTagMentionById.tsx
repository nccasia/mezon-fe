import { useEmojiSuggestion } from '@mezon/core';
import { selectAllUsesClan, selectChannelById } from '@mezon/store';
import { checkLastChar, getSrcEmoji } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Icons } from '../../../components';
import { EmojiMarkdown } from '../../MarkdownFormatText';

interface IHashtagMentionById {
	id: string;
	posMention?: boolean;
}

const HashTagMentionById = ({ id, posMention }: IHashtagMentionById) => {
	const { emojis } = useEmojiSuggestion();
	const checkEmojiIsExist = getSrcEmoji(id.trim(), emojis);

	return (
		<span>
			{id.startsWith('@') ? (
				<MentionReply mentionId={id} />
			) : id.startsWith('<') ? (
				<HashTagReply hashtagId={id} posMention={posMention} />
			) : checkEmojiIsExist ? (
				<EmojiMarkdown emojiSyntax={id} onlyEmoji={false} posReply={true} />
			) : (
				<span>{id}</span>
			)}
		</span>
	);
};

export default memo(HashTagMentionById);

interface IHashtag {
	hashtagId: string;
	posMention?: boolean;
}

const HashTagReply = ({ hashtagId, posMention }: IHashtag) => {
	const getChannelById = (hashtagId: string) => {
		const channel = useSelector(selectChannelById(hashtagId));
		return channel;
	};
	const channel = getChannelById(hashtagId.slice(2, -1));

	return getChannelById(hashtagId.slice(2, -1)) ? (
		<span className="font-medium rounded-sm  !text-[#3297ff] dark:bg-[#3C4270] bg-[#D1E0FF] ">
			{channel.type === ChannelType.CHANNEL_TYPE_VOICE ? (
				<Icons.Speaker
					defaultSize={`inline mt-[-0.2rem] w-4 h-4 ${posMention ? 'ml-[-0.05rem] mr-[0.5rem]' : 'ml-[-0.5rem]'}`}
					defaultFill="#3297FF"
				/>
			) : (
				<Icons.Hashtag
					defaultSize={`inline mt-[-0.5rem] w-4 h-4 ${posMention ? 'ml-[-0.05rem] mr-[0.5rem]' : 'ml-[-0.5rem]'}`}
					defaultFill="#3297FF"
				/>
			)}
			<span className="ml-[-0.5rem]">{channel.channel_label}</span>
		</span>
	) : (
		<>
			<span className="font-medium rounded-sm !text-[#3297ff] dark:bg-[#3C4270] bg-[#D1E0FF] ">
				<Icons.Hashtag defaultSize="inline mt-[-0.5rem] w-4 h-4 mr-[-0.5rem] ml-[-0.5rem]" defaultFill="#3297FF" />
				unknown
			</span>
		</>
	);
};

interface IMention {
	mentionId: string;
}

const MentionReply = ({ mentionId }: IMention) => {
	const usersClan = useSelector(selectAllUsesClan);
	const [foundUser, setFoundUser] = useState<any>(null);
	const username = mentionId.slice(1);
	const [userRemoveChar, setUserRemoveChar] = useState('');

	useEffect(() => {
		if (checkLastChar(username)) {
			setUserRemoveChar(username.slice(0, -1));
		} else {
			setUserRemoveChar(username);
		}
		const user = usersClan.find((userClan) => userClan.user?.username === userRemoveChar);
		if (user) {
			setFoundUser(user);
		} else {
			setFoundUser(null);
		}
	}, [mentionId, userRemoveChar]);

	return (
		<>
			{foundUser !== null || mentionId === '@here' ? (
				<span
					className={`font-medium px-0.1 rounded-sm
				 !text-[#3297ff]  dark:bg-[#3C4270] bg-[#D1E0FF] `}
				>
					@{foundUser?.user?.username ? foundUser?.user?.username : 'here'}
				</span>
			) : (
				<span>{mentionId}</span>
			)}
		</>
	);
};
