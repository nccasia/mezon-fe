import { useAppParams, useChatReaction, useEmojiSuggestion, useGifsStickersEmoji } from '@mezon/core';
import { reactionActions, selectCurrentChannel, selectDirectById, selectMessageByMessageId, selectReactionPlaceActive } from '@mezon/store';
import { EmojiPlaces, IEmoji, SubPanelName } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Icons } from '../../components';

export type EmojiCustomPanelOptions = {
	messageEmojiId?: string | undefined;
	mode?: number;
	isReaction?: boolean;
};

function EmojiCustomPanel(props: EmojiCustomPanelOptions) {
	const dispatch = useDispatch();

	const messageEmoji = useSelector(selectMessageByMessageId(props.messageEmojiId ?? ''));
	const { categoriesEmoji, emojis, setAddEmojiActionChatbox, addEmojiState, shiftPressedState } = useEmojiSuggestion();
	const containerRef = useRef<HTMLDivElement>(null);
	const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
	const { valueInputToCheckHandleSearch, subPanelActive } = useGifsStickersEmoji();
	const [emojisSearch, setEmojiSearch] = useState<IEmoji[]>();
	const reactionPlaceActive = useSelector(selectReactionPlaceActive);

	const searchEmojis = (emojis: any[], searchTerm: string) => {
		return emojis.filter((emoji) => emoji?.shortname?.includes(searchTerm));
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
		<Icons.ClockHistory defaultSize="w-7 h-7" />,
		<Icons.PenEdit defaultSize="w-7 h-7" />,
		<Icons.Smile defaultSize="w-7 h-7" />,
		<Icons.TheLeaf defaultSize="w-7 h-7" />,
		<Icons.Bowl defaultSize="w-7 h-7" />,
		<Icons.GameController defaultSize="w-7 h-7" />,
		<Icons.Bicycle defaultSize="w-7 h-7" />,
		<Icons.Object defaultSize="w-7 h-7" />,
		<Icons.Heart defaultSize="w-7 h-7" />,
		<Icons.Ribbon defaultSize="w-7 h-7" />,
	];
	const categoriesWithIcons = categoriesEmoji.map((category, index) => ({ name: category, icon: categoryIcons[index] }));
	const { reactionMessageDispatch } = useChatReaction();

	const { setSubPanelActive, setPlaceHolderInput } = useGifsStickersEmoji();
	const { setEmojiSuggestion } = useEmojiSuggestion();
	const [emojiHoverSrc, setEmojiHoverSrc] = useState<string>('');
	const [emojiHoverShortCode, setEmojiHoverShortCode] = useState<string>('');
	const [selectedCategory, setSelectedCategory] = useState<string>('');
	const { setShiftPressed } = useEmojiSuggestion();
	const currentChannel = useSelector(selectCurrentChannel);
	const { directId } = useAppParams();
	const [channelID, setChannelID] = useState('');
	const direct = useSelector(selectDirectById(directId || ''));

	useEffect(() => {
		if (direct !== undefined) {
			setChannelID(direct.id);
		} else {
			setChannelID(currentChannel?.id || '');
		}
	}, [currentChannel, direct, directId]);

	const handleEmojiSelect = async (emojiPicked: string) => {
		if (subPanelActive === SubPanelName.EMOJI_REACTION_RIGHT || subPanelActive === SubPanelName.EMOJI_REACTION_BOTTOM) {
			await reactionMessageDispatch(
				'',
				props.mode ?? ChannelStreamMode.STREAM_MODE_CHANNEL,
				channelID ?? '',
				props.messageEmojiId ?? '',
				emojiPicked.trim(),
				1,
				messageEmoji?.sender_id ?? '',
				false,
			);
			setSubPanelActive(SubPanelName.NONE);
		} else if (subPanelActive === SubPanelName.EMOJI) {
			setAddEmojiActionChatbox(!addEmojiState);
			setEmojiSuggestion(emojiPicked);

			if (!shiftPressedState) {
				dispatch(reactionActions.setReactionPlaceActive(EmojiPlaces.EMOJI_REACTION_NONE));
				setSubPanelActive(SubPanelName.NONE);
			}
		}
	};

	const handleOnHover = (emojiHover: any) => {
		setEmojiHoverSrc(emojiHover.src);
		setEmojiHoverShortCode(emojiHover.shortname);
		setPlaceHolderInput(emojiHover.shortname);
	};

	const scrollToCategory = (event: React.MouseEvent, categoryName: string) => {
		event.stopPropagation();
		if (categoryName !== selectedCategory) {
			setSelectedCategory(categoryName);
			const categoryDiv = categoryRefs.current[categoryName];
			if (categoryDiv && containerRef.current) {
				const options: ScrollIntoViewOptions = { behavior: 'auto', block: 'start' };
				const containerTop = containerRef.current.getBoundingClientRect().top;
				const categoryTop = categoryDiv.getBoundingClientRect().top;
				const offset = 0;
				const scrollTop = categoryTop - containerTop - offset;
				containerRef.current.scrollTop += scrollTop;
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

	const handleShiftKeyDown = (event: KeyboardEvent) => {
		if (event.shiftKey) {
			setShiftPressed(true);
		}
	};
	const handleShiftKeyUp = () => {
		setShiftPressed(false);
	};

	useEffect(() => {
		window.addEventListener('keydown', handleShiftKeyDown);
		window.addEventListener('keyup', handleShiftKeyUp);
		return () => {
			window.removeEventListener('keydown', handleShiftKeyDown);
			window.removeEventListener('keyup', handleShiftKeyUp);
		};
	}, []);

	return (
		<div
			className={`flex max-h-full max-sm:h-32 flex-row max-sm:flex-col w-full md:w-[500px] max-sm:ml-1 ${props.isReaction && 'border border-black rounded overflow-hidden'}`}
		>
			<div
				className={`w-[10%] max-sm:gap-x-1
				flex flex-col max-sm:flex-row max-sm:justify-end gap-y-1 
				max-sm:w-full dark:bg-[#1E1F22] bg-bgLightModeSecond pt-1
				px-1 md:items-start h-[25rem] pb-1 rounded 
				${!props.isReaction && 'md:ml-2 mb-2'}`}
			>
				<div className="w-9 h-9 max-sm:hidden flex flex-row justify-center items-center dark:hover:bg-[#41434A] hover:bg-bgLightModeButton hover:rounded-md">
					<Icons.Star defaultSize="w-7 h-7" />
				</div>
				<hr className=" bg-gray-200 border w-full max-sm:h-full max-sm:w-[1px] max-sm:hidden" />
				{categoriesWithIcons.map((item, index) => {
					return (
						<button
							key={index}
							className={`w-9 h-9 max-sm:px-1 flex flex-row justify-center items-center ${selectedCategory === item.name ? 'bg-[#41434A]' : 'hover:bg-[#41434A]'} rounded-md`}
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
					<EmojiHover emojiHoverSrc={emojiHoverSrc} emojiHoverShortCode={emojiHoverShortCode} isReaction={props.isReaction} />
				</div>
			) : (
				<div className="flex flex-col">
					<div
						ref={containerRef}
						className="w-full  max-h-[352px] overflow-y-scroll pt-0 overflow-x-hidden hide-scrollbar dark: bg-transparent bg-bgLightMode"
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
					<EmojiHover emojiHoverSrc={emojiHoverSrc} emojiHoverShortCode={emojiHoverShortCode} isReaction={props.isReaction} />
				</div>
			)}
		</div>
	);
}

export default EmojiCustomPanel;

type DisplayByCategoriesProps = {
	readonly categoryName?: string;
	readonly onEmojiSelect: (emoji: string) => void;
	readonly onEmojiHover: (item: any) => void;
	readonly emojisData: any[];
};

function DisplayByCategories({ emojisData, categoryName, onEmojiSelect, onEmojiHover }: DisplayByCategoriesProps) {
	const getEmojisByCategories = (emojis: any[], categoryParam: string) => {
		const filteredEmojis = emojis
			.filter((emoji) => emoji?.category?.includes(categoryParam))
			.map((emoji) => ({
				...emoji,
				category: emoji.category,
			}));
		return filteredEmojis;
	};
	const emojisByCategoryName = getEmojisByCategories(emojisData, categoryName ?? '');

	const [emojisPanel, setEmojisPanelStatus] = useState<boolean>(true);
	return (
		<div>
			<button
				onClick={() => setEmojisPanelStatus(!emojisPanel)}
				className="w-full flex flex-row justify-start items-center pl-1 mb-1 mt-0 py-1 sticky top-[-0.5rem] dark:bg-[#2B2D31] bg-bgLightModeSecond z-10 dark:text-white text-black"
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
	const { shiftPressedState } = useEmojiSuggestion();

	return (
		<div
			className={`  grid grid-cols-9 ml-1 gap-1   ${valueInputToCheckHandleSearch !== '' ? 'overflow-y-scroll overflow-x-hidden hide-scrollbar max-h-[352px]' : ''}`}
		>
			{' '}
			{emojisData.map((item, index) => (
				<button
					key={index}
					className={`${shiftPressedState ? 'border-none outline-none' : ''} text-2xl  emoji-button  rounded-md  dark:hover:bg-[#41434A] hover:bg-bgLightModeButton hover:rounded-md w-10  p-1 flex items-center justify-center w-full`}
					onClick={() => onEmojiSelect(item.shortname + ' ')}
					onMouseEnter={() => onEmojiHover(item)}
				>
					<img draggable="false" src={item?.src}></img>
				</button>
			))}
		</div>
	);
};

type EmojiHoverProps = {
	emojiHoverSrc: string;
	emojiHoverShortCode: string;
	isReaction: boolean | undefined;
};

const EmojiHover = ({ emojiHoverSrc, emojiHoverShortCode, isReaction }: EmojiHoverProps) => {
	return (
		<div
			className={`w-full min-h-12 dark:bg-[#232428] bg-bgLightModeSecond flex flex-row items-center pl-1 gap-x-1 justify-start dark:text-white text-black ${!isReaction && 'mb-2'}`}
		>
			<img draggable="false" className="w-10" src={emojiHoverSrc}></img>
			{emojiHoverShortCode}
		</div>
	);
};
