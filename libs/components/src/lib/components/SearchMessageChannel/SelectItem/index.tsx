import { Icons } from '@mezon/components';

type SelectItemProps = {
	title?: string;
	content?: string;
	onClick?: () => void;
};

const SelectItem = ({ title, content, onClick }: SelectItemProps) => {
	return (
		<button
			onClick={onClick}
			className="flex flex-row justify-between items-center group w-full cursor-pointer hover:bg-bgSearchHover hover:opacity-90 rounded py-1 px-2"
		>
			<div>
				<span className="font-semibold">{title}</span>
				<span>{content}</span>
			</div>
			<div className="group-hover:opacity-100 opacity-0">
				<Icons.Plus />
			</div>
		</button>
	);
};

export default SelectItem;
