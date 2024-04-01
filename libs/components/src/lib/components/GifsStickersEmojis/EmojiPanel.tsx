import { useEmojis } from '@mezon/core';

type EmojiPickerProps = {
	type?: string;
};

function EmojiPickerPanel({ props }: EmojiPickerProps) {
	const { emojis, categoryEmoji } = useEmojis();
	console.log(emojis);
	console.log(categoryEmoji);

	return (
		<>
			<div className="flex h-full pr-2">
				{/* <div className="w-[40%] flex flex-col px-2 gap-y-2 max-w-[40%]">
					{categoryEmoji.map((avt) => (
						
					))}
				</div> */}
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
