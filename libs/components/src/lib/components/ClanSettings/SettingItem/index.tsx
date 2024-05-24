type SettingItemProps = {
	name: string;
	active?: boolean;
	onClick: () => void;
};

const SettingItem = ({ name, active, onClick }: SettingItemProps) => {
	return (
		<button
			className={`dark:text-textPrimary text-buttonProfile w-full py-1 px-[10px] mb-1 text-[16px] font-medium rounded text-left ${active ? 'dark:bg-bgModifierHover bg-bgModifierHoverLight dark:text-white text-textSecondary400' : ''} dark:hover:bg-bgHover hover:bg-bgModifierHoverLight`}
			onClick={() => onClick()}
		>
			{name}
		</button>
	);
};

export default SettingItem;
