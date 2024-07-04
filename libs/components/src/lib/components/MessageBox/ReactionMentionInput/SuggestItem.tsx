import { useEmojiSuggestion } from '@mezon/core';
import { selectCurrentChannelId } from '@mezon/store';
import { getSrcEmoji } from '@mezon/utils';
import { useSelector } from 'react-redux';
import { AvatarImage } from '../../AvatarImage/AvatarImage';

type SuggestItemProps = {
	avatarUrl?: string;
	symbol?: string;
	name: string;
	displayName?: string;
	subText?: string;
	valueHightLight?: string;
	subTextStyle?: string;
	showAvatar?: boolean;
};

const SuggestItem = ({ avatarUrl, symbol, name, displayName, subText, subTextStyle, valueHightLight, showAvatar }: SuggestItemProps) => {
	const { emojis } = useEmojiSuggestion();
	const urlEmoji = getSrcEmoji(name, emojis);
	const currentChannelId = useSelector(selectCurrentChannelId);

	const highlightMatch = (name: string, getUserName: string) => {
		const index = name.toLowerCase().indexOf(getUserName.toLowerCase());
		if (index === -1) {
			return name;
		}
		const beforeMatch = name.slice(0, index);
		const match = name.slice(index, index + getUserName.length);
		const afterMatch = name.slice(index + getUserName.length);
		return (
			<>
				{beforeMatch}
				<span className="font-bold">{match}</span>
				{afterMatch}
			</>
		);
	};

	return (
		<div className="flex flex-row items-center justify-between h-[24px]">
			<div className="flex flex-row items-center gap-2 py-[3px]">
				{showAvatar && <AvatarImage alt="user avatar" userName={name} src={avatarUrl} className="size-8" />}
				{urlEmoji && <img src={urlEmoji} alt={urlEmoji} style={{ width: '32px', height: '32px', objectFit: 'cover' }} />}
				{symbol && <span className="text-[17px] dark:text-textDarkTheme text-textLightTheme">{symbol}</span>}
				<span className="text-[15px] font-thin dark:text-white text-textLightTheme">{highlightMatch(name, valueHightLight ?? '')}</span>
			</div>
			<span className={`text-[10px] font-semibold text-[#A1A1AA] uppercase ${subTextStyle}`}>{subText}</span>
		</div>
	);
};

export default SuggestItem;
