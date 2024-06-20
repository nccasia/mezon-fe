import { selectCloseMenu } from "@mezon/store";
import { useSelector } from "react-redux";

type SettingItemProps = {
	name: string;
	active?: boolean;
	onClick: () => void;
	handleMenu: (value: boolean) => void;
};

const SettingItem = ({ name, active, onClick, handleMenu }: SettingItemProps) => {
	const closeMenu = useSelector(selectCloseMenu);
	return (
		<button
			className={`dark:text-textPrimary text-buttonProfile w-full py-1 px-[10px] mb-1 text-[16px] font-medium rounded text-left ${active ? 'dark:bg-bgModifierHover bg-bgModifierHoverLight dark:text-white text-textSecondary400' : ''} dark:hover:bg-bgHover hover:bg-bgModifierHoverLight`}
			onClick={() => {
				onClick(); 
				if(closeMenu){
					handleMenu(false);
				}
			}}
		>
			{name}
		</button>
	);
};

export default SettingItem;
