import { useChatReaction, useEmojiSuggestion, useGifsStickersEmoji, useReference } from '@mezon/core';
import { EmojiPlaces, IEmoji, IMessageWithUser, SubPanelName } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { useEffect, useRef, useState } from 'react';
import { Icons } from '../../components';

export type EmojiCustomPanelOptions = {
	messageEmoji?: IMessageWithUser;
	emojiAction?: EmojiPlaces;
	mode?: number;
	isReaction?: boolean;
};

function EmojiCustomPanel(props: EmojiCustomPanelOptions) {
	const { emojis, categoriesEmoji } = useEmojiSuggestion();
	const containerRef = useRef<HTMLDivElement>(null);
	const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
	const dataCategories = categoriesEmoji(emojis);
	const { valueInputToCheckHandleSearch, subPanelActive } = useGifsStickersEmoji();
	const [emojisSearch, setEmojiSearch] = useState<IEmoji[]>();
	const { reactionPlaceActive } = useChatReaction();

	const searchEmojis = (emojis: IEmoji[], searchTerm: string) => {
		return emojis.filter((emoji) => emoji.shortname.includes(searchTerm));
	};

	useEffect(() => {
		if (
			(valueInputToCheckHandleSearch !== '' && subPanelActive === SubPanelName.EMOJI) ||
			reactionPlaceActive === EmojiPlaces.EMOJI_REACTION_BOTTOM ||
			reactionPlaceActive === EmojiPlaces.EMOJI_REACTION
		) {
			const result = searchEmojis(emojis, valueInputToCheckHandleSearch ?? '');
			setEmojiSearch(result);
		}
	}, [valueInputToCheckHandleSearch]);

	const categoryIcons = [
		<Icons.MemberList defaultSize="w-7 h-7" />,
		<Icons.Smile defaultSize="w-7 h-7" />,
		<Icons.GameController defaultSize="w-7 h-7" />,
		<Icons.Heart defaultSize="w-7 h-7" />,
		<Icons.Object defaultSize="w-7 h-7" />,
		<Icons.TheLeaf defaultSize="w-7 h-7" />,
		<Icons.Bicycle defaultSize="w-7 h-7" />,
		<Icons.Bowl defaultSize="w-7 h-7" />,
		<Icons.Ribbon defaultSize="w-7 h-7" />,
	];
	const categoriesWithIcons = dataCategories
		.map((category, index) => ({ name: category, icon: categoryIcons[index] }))
		.filter((category) => category.name !== '' && category.name !== 'Component');
	[categoriesWithIcons[0], categoriesWithIcons[1]] = [categoriesWithIcons[1], categoriesWithIcons[0]];

	const {
		reactionMessageDispatch,
		setReactionRightState,
		setReactionBottomState,
		setReactionPlaceActive,
		setUserReactionPanelState,
		setReactionBottomStateResponsive,
		setMessageMatchWithRef,
	} = useChatReaction();
	const { setReferenceMessage } = useReference();
	const { setSubPanelActive, setPlaceHolderInput } = useGifsStickersEmoji();
	const { setEmojiSuggestion } = useEmojiSuggestion();
	const [emojiHoverNative, setEmojiHoverNative] = useState<string>('');
	const [emojiHoverShortCode, setEmojiHoverShortCode] = useState<string>('');
	const [selectedCategory, setSelectedCategory] = useState<string>('');

	const handleEmojiSelect = async (emojiPicked: string) => {
		
		if (props.emojiAction === EmojiPlaces.EMOJI_REACTION || props.emojiAction === EmojiPlaces.EMOJI_REACTION_BOTTOM) {
			await reactionMessageDispatch(
				'',
				props.mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL,
				props.messageEmoji?.id ?? '',
				emojiPicked,
				1,
				props.messageEmoji?.sender_id ?? '',
				false,
			);
			setReactionRightState(false);
			setReactionBottomState(false);
			setReactionPlaceActive(EmojiPlaces.EMOJI_REACTION_NONE);
			setReferenceMessage(null);
			setUserReactionPanelState(false);
			setReactionBottomStateResponsive(false);
			setMessageMatchWithRef(false);
		} else if (props.emojiAction === EmojiPlaces.EMOJI_EDITOR) {
			setEmojiSuggestion(emojiPicked);
			setReactionPlaceActive(EmojiPlaces.EMOJI_REACTION_NONE);
			setSubPanelActive(SubPanelName.NONE);
		}
	};

	const handleOnHover = (emojiHover: IEmoji) => {
		setEmojiHoverNative(emojiHover.emoji);
		setEmojiHoverShortCode(emojiHover.shortname);
		setPlaceHolderInput(emojiHover.shortname);
	};

	const scrollToCategory = (event: React.MouseEvent, categoryName: string) => {
		event.stopPropagation();
		if (categoryName !== selectedCategory) {
			setSelectedCategory(categoryName);
			const categoryDiv = categoryRefs.current[categoryName];
			if (categoryDiv && containerRef.current) {
				categoryDiv.scrollIntoView({ behavior: 'auto', block: 'start' });
			}
		}
	};

	useEffect(() => {
		const handleScroll = () => {
			if (containerRef.current) {
				const containerRect = containerRef.current.getBoundingClientRect();
				const containerTop = containerRect.top;
				const containerBottom = containerRect.bottom;

				let closestCategory = '';
				let minDistance = Number.MAX_VALUE;

				Object.keys(categoryRefs.current).forEach((category) => {
					const ref = categoryRefs.current[category];
					if (ref) {
						const refRect = ref.getBoundingClientRect();
						const refTop = refRect.top;
						const refBottom = refRect.bottom;

						const distanceTop = Math.abs(refTop - containerTop);
						const distanceBottom = Math.abs(refBottom - containerBottom);

						const distance = Math.min(distanceTop, distanceBottom);

						if (distance < minDistance) {
							minDistance = distance;
							closestCategory = category;
						}
					}
				});
				setSelectedCategory(closestCategory);
			}
		};

		const container = containerRef.current;
		if (container) {
			container.addEventListener('scroll', handleScroll);
			return () => container.removeEventListener('scroll', handleScroll);
		}
	}, []);

	return (
		<div className={`flex max-h-full flex-row w-full md:w-[500px] ${props.isReaction && 'border border-black rounded overflow-hidden'}`}>
			<div
				className={`w-[10%] md:w-[10%] md:max-w-[10%] flex flex-col gap-y-1 max-w-[90%] dark:bg-[#1E1F22] bg-bgLightModeSecond pt-1 px-1 md:items-start h-[25rem] pb-1 rounded ${!props.isReaction && 'md:ml-2 mb-2'}`}
			>
				<div className="w-9 h-9  flex flex-row justify-center items-center dark:hover:bg-[#41434A] hover:bg-bgLightModeButton hover:rounded-md">
					<Icons.Star defaultSize="w-7 h-7" />
				</div>
				<div className="w-9 h-9  flex flex-row justify-center items-center dark:hover:bg-[#41434A] hover:bg-bgLightModeButton hover:rounded-md">
					<Icons.ClockHistory defaultSize="w-7 h-7" />
				</div>
				<hr className=" bg-gray-200  border w-full" />
				{categoriesWithIcons.map((item, index) => {
					return (
						<button
							key={index}
							className={`w-9 h-9 flex flex-row justify-center items-center ${selectedCategory === item.name ? 'bg-[#41434A]' : 'hover:bg-[#41434A]'} rounded-md`}
							onClick={(e) => scrollToCategory(e, item.name)}
						>
							{item.icon}
						</button>
					);
				})}
			</div>
			{valueInputToCheckHandleSearch !== '' && emojisSearch ? (
				<div className=" h-[400px]  w-full">
					<div className="h-[352px]">
						{' '}
						<EmojisPanel emojisData={emojisSearch} onEmojiSelect={handleEmojiSelect} onEmojiHover={handleOnHover} />
					</div>
					<EmojiHover emojiHoverNative={emojiHoverNative} emojiHoverShortCode={emojiHoverShortCode} isReaction={props.isReaction} />
				</div>
			) : (
				<div className="flex flex-col">
					<div
						ref={containerRef}
						className="w-full  max-h-[352px]  overflow-y-scroll pt-0 overflow-x-hidden hide-scrollbar dark:bg-bgPrimary bg-bgLightMode"
					>
						{categoriesWithIcons.map((item, index) => {
							return (
								<div className="w-full" key={item.name} ref={(el) => (categoryRefs.current[item.name] = el)}>
									<DisplayByCategories
										emojisData={emojis}
										onEmojiSelect={handleEmojiSelect}
										onEmojiHover={handleOnHover}
										categoryName={item.name}
									/>
								</div>
							);
						})}
					</div>
					<EmojiHover emojiHoverNative={emojiHoverNative} emojiHoverShortCode={emojiHoverShortCode} isReaction={props.isReaction} />
				</div>
			)}
		</div>
	);
}

export default EmojiCustomPanel;

type DisplayByCategoriesProps = {
	readonly categoryName?: string;
	readonly onEmojiSelect: (emoji: string) => void;
	readonly onEmojiHover: (item: IEmoji) => void;
	readonly emojisData: IEmoji[];
};
function DisplayByCategories({ categoryName, onEmojiSelect, onEmojiHover }: DisplayByCategoriesProps) {
	const { emojis } = useEmojiSuggestion();

	const getEmojisByCategories = (emojis: IEmoji[], categoryParam: string, limit: number) => {
		const filteredEmojis = emojis
			.filter((emoji) => emoji.category.includes(categoryParam))
			.map((emoji) => ({
				...emoji,
				category: emoji.category.replace(/ *\([^)]*\) */g, ''),
			}));

		return filteredEmojis.slice(0, limit);
	};
	const emojisByCategoryName = categoryName ? getEmojisByCategories(emojis, categoryName, 70) : [];
	const [emojisPanel, setEmojisPanelStatus] = useState<boolean>(true);
	const { valueInputToCheckHandleSearch } = useGifsStickersEmoji();

	return (
		<div>
			<button
				onClick={() => setEmojisPanelStatus(!emojisPanel)}
				className="w-full flex flex-row justify-start items-center pl-1 mb-1 mt-0 py-1 sticky top-0 dark:bg-[#2B2D31] bg-bgLightModeSecond z-10 dark:text-white text-black"
			>
				{categoryName}
				<span className={`${emojisPanel ? ' rotate-90' : ''}`}>
					{' '}
					<Icons.ArrowRight />
				</span>
			</button>

			{emojisPanel && <EmojisPanel emojisData={emojisByCategoryName} onEmojiSelect={onEmojiSelect} onEmojiHover={onEmojiHover} />}
		</div>
	);
}

const EmojisPanel: React.FC<DisplayByCategoriesProps> = ({ emojisData, onEmojiSelect, onEmojiHover }) => {
	const { valueInputToCheckHandleSearch } = useGifsStickersEmoji();

	return (
		<div
			className={`grid grid-cols-9 ml-1 gap-1  ${valueInputToCheckHandleSearch !== '' ? 'overflow-y-scroll overflow-x-hidden hide-scrollbar max-h-[352px]' : ''}`}
		>
			{' '}
			{emojisData.map((item, index) => (
				<button
					key={index}
					className="text-3xl emoji-button border rounded-md border-[#363A53] dark:hover:bg-[#41434A] hover:bg-bgLightModeButton hover:rounded-md w-10 h-10 p-1 flex items-center justify-center w-full"
					onClick={() => onEmojiSelect(item.emoji)}
					onMouseEnter={() => onEmojiHover(item)}
				>
					{item.emoji}
				</button>
			))}
		</div>
	);
};

type EmojiHoverProps = {
	emojiHoverNative: string;
	emojiHoverShortCode: string;
	isReaction: boolean | undefined;
};

const EmojiHover = ({ emojiHoverNative, emojiHoverShortCode, isReaction }: EmojiHoverProps) => {
	return (
		<div
			className={`w-full min-h-12 dark:bg-[#232428] bg-bgLightModeSecond flex flex-row items-center pl-1 gap-x-1 justify-start dark:text-white text-black ${!isReaction && 'mb-2'}`}
		>
			<span className="text-3xl"> {emojiHoverNative}</span>
			{emojiHoverShortCode}
		</div>
	);
};
