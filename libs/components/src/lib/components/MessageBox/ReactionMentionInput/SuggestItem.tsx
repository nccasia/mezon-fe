import { selectCurrentChannelId } from '@mezon/store';
import { getSrcEmoji } from '@mezon/utils';
import useDataEmojiSvg from 'libs/core/src/lib/chat/hooks/useDataEmojiSvg';
import { useSelector } from 'react-redux';

type SuggestItemProps = {
	avatarUrl?: string;
	symbol?: string;
	name: string;
	subText?: string;
	valueHightLight?: string;
};

const SuggestItem = ({ avatarUrl, symbol, name, subText, valueHightLight }: SuggestItemProps) => {
	const { emojiListPNG } = useDataEmojiSvg();
	const urlEmoji = getSrcEmoji(name, emojiListPNG);
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
		<div className="flex flex-row items-center justify-between h-[38px]">
			<div className="flex flex-row items-center gap-2 py-[3px]">
				{avatarUrl && <img src={avatarUrl} alt={name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
				{urlEmoji && <img src={urlEmoji} alt={urlEmoji} style={{ width: '32px', height: '32px' }} />}
				{symbol && <span className="text-[17px] dark:text-textDarkTheme text-textLightTheme">{symbol}</span>}
				<span className="text-[15px] font-thin dark:text-white text-textLightTheme">{highlightMatch(name, valueHightLight ?? '')}</span>
			</div>
			<span className="text-[10px] font-semibold text-[#A1A1AA] uppercase">{subText}</span>
		</div>
	);
};

export default SuggestItem;
