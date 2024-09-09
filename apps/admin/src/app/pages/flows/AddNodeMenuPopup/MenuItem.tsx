interface MenuItemProps {
	title: string;
	description: string;
	imageUrl: string;
}
const MenuItem = ({ title, description, imageUrl }: MenuItemProps) => {
	const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
		event.dataTransfer.effectAllowed = 'move';
	};
	return (
		<div
			className="menu-item cursor-pointer p-2 mt-1 mb-1 radius-md rounded-2xl hover:bg-gray-50 shadow-md transition-all"
			onDragStart={onDragStart}
			draggable
		>
			<div className="flex gap-2 items-center w-full">
				<div className="w-[50px] flex items-center justify-center">
					<img src={imageUrl} alt="" className="rounded-full w-[40px] h-[40px]" />
				</div>
				<div className="flex-1 select-none">
					<div className="text-[14px] font-semibold">{title}</div>
					<p className="text-[12px] text-gray-500 ">{description}</p>
				</div>
			</div>
		</div>
	);
};
export default MenuItem;
