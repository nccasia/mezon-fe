type SuggestItemProps = {
	avatarUrl?: string;
	symbol?: string;
	name: string;
	subText?: string;
};

const SuggestItem = ({ avatarUrl, symbol, name, subText }: SuggestItemProps) => {
	return (
		<div className="flex flex-row items-center justify-between h-[38px]">
			<div className="flex flex-row items-center gap-2 py-[3px]">
				{avatarUrl && <img src={avatarUrl} alt={name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
				{symbol && <span className="text-[17px]">{symbol}</span>}
				<span className="text-[15px] font-medium dark:text-white text-textLightTheme">{name}</span>
			</div>
			<span className="text-[10px] font-semibold text-[#A1A1AA] uppercase">{subText}</span>
		</div>
	);
};

export default SuggestItem;
