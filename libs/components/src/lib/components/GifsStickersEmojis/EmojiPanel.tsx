import { useEmojis } from '@mezon/core';
import { ICategoryEmoji } from '@mezon/utils';

type EmojiPickerProps = {
	type?: string;
};

function EmojiPickerPanel({ props }: EmojiPickerProps) {
	const { emojis, categoryEmoji } = useEmojis();

	return (
		<>
			<div className="flex h-full pr-2 ">
				<div className="w-[20%] flex flex-col  gap-y-2 max-w-[40%] border hide-scrollbar max-h-[400px]">
					{Array.isArray(categoryEmoji) &&
						categoryEmoji.map((item: ICategoryEmoji) => {
							return (
								<div
									className={`w-[47px] h-[47px]  cursor-pointer hover:bg-bgDisable  hover:rounded-lg justify-center items-center border border-bgHoverMember rounded-lg`}
								>
									{item.id}
								</div>
							);
						})}
				</div>
				{/* <div className="w-auto pb-2">
					<div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-scroll hide-scrollbar">
						{selectImage.map((image: any) => (
							<img
								key={image.id}
								src={image.url}
								alt={`Image ${image.id}`}
								className="w-full h-auto cursor-pointer hover:bg-bgDisable hover:rounded-lg border border-bgHoverMember rounded-lg"
								onClick={() => handleClickImage(image.url)}
							/>
						))}
					</div>
				</div> */}
			</div>
		</>
	);
}

export default EmojiPickerPanel;
