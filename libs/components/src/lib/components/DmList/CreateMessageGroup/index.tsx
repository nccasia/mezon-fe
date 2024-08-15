import { useAppNavigation, useFriends } from '@mezon/core';
import { FriendsEntity, IFriend, directActions, selectAllFriends, useAppDispatch } from '@mezon/store';
import { Icons, InputField } from '@mezon/ui';
import { ChannelType } from 'mezon-js';
import { ApiCreateChannelDescRequest } from 'mezon-js/api.gen';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AvatarImage } from '../../AvatarImage/AvatarImage';
import EmptySearchFriends from './EmptySearchFriends';

type CreateMessageGroupProps = {
	isOpen: boolean;
	onClose: () => void;
};

const ITEM_HEIGHT = 40;

const CreateMessageGroup = ({ onClose }: CreateMessageGroupProps) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { toDmGroupPage } = useAppNavigation();
	const friends = useSelector(selectAllFriends);

	const [searchTerm, setSearchTerm] = useState<string>('');
	const [idActive, setIdActive] = useState<string>('');
	const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
	const boxRef = useRef<HTMLDivElement | null>(null);

	const { filteredFriends } = useFriends();

	const listFriends = filteredFriends(searchTerm.trim().toUpperCase());

	const handleSelectFriends = (idFriend: string) => {
		setSelectedFriends((prevSelectedFriends) => {
			if (prevSelectedFriends.includes(idFriend)) {
				return prevSelectedFriends.filter((friend) => friend !== idFriend);
			} else {
				return [...prevSelectedFriends, idFriend];
			}
		});
	};

	const handleCheckboxChange = (e?: React.ChangeEvent<HTMLInputElement>) => {
		const value = e?.target.value ?? '';
		handleSelectFriends(value);
	};

	const resetAndCloseModal = () => {
		setSelectedFriends([]);
		onClose();
	};

	const handleCreateDM = async () => {
		const bodyCreateDmGroup: ApiCreateChannelDescRequest = {
			type: selectedFriends.length > 1 ? ChannelType.CHANNEL_TYPE_GROUP : ChannelType.CHANNEL_TYPE_DM,
			channel_private: 1,
			user_ids: selectedFriends,
		};

		const response = await dispatch(directActions.createNewDirectMessage(bodyCreateDmGroup));
		const resPayload = response.payload as ApiCreateChannelDescRequest;
		if (resPayload.channel_id) {
			await dispatch(
				directActions.joinDirectMessage({
					directMessageId: resPayload.channel_id,
					channelName: resPayload.channel_label,
					type: Number(resPayload.type),
				}),
			);
			const directChat = toDmGroupPage(resPayload.channel_id, Number(resPayload.type));
			navigate(directChat);
		}
		resetAndCloseModal();
	};

	useEffect(() => {
		if (idActive === '' && listFriends.length > 0) {
			setIdActive(listFriends[0]?.id ?? '');
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			const currentIndex = listFriends.findIndex((item) => item?.id === idActive);
			if (currentIndex === -1) return;

			switch (event.key) {
				case 'ArrowDown':
					event.preventDefault();
					handleArrowDown(listFriends, currentIndex);
					break;

				case 'ArrowUp':
					event.preventDefault();
					handleArrowUp(listFriends, currentIndex);
					break;

				case 'Enter':
					event.preventDefault();
					handleEnter(listFriends, idActive);
					break;

				default:
					break;
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [idActive, listFriends]);

	const handleArrowDown = (listFriends: FriendsEntity[], currentIndex: number) => {
		const nextIndex = currentIndex === listFriends.length - 1 ? 0 : currentIndex + 1;
		const newItem = listFriends[nextIndex];

		if (!boxRef.current || !newItem) return;
		const boxHeight = boxRef.current.clientHeight;
		const newItemOffset = (ITEM_HEIGHT + 4) * nextIndex;
		const newScrollTop = newItemOffset + ITEM_HEIGHT - boxHeight;
		const totalItemsHeight = listFriends.length * ITEM_HEIGHT;
		const maxScrollTop = Math.max(totalItemsHeight - boxHeight, 0);

		boxRef.current.scroll({
			top: Math.min(newScrollTop, maxScrollTop),
			behavior: 'smooth',
		});

		setIdActive(newItem.id ?? '');
	};

	const handleArrowUp = (listFriends: FriendsEntity[], currentIndex: number) => {
		const prevIndex = currentIndex === 0 ? listFriends.length - 1 : currentIndex - 1;
		const newItem = listFriends[prevIndex];

		if (!boxRef.current || !newItem) return;

		const boxHeight = boxRef.current.clientHeight;
		const newItemOffset = (ITEM_HEIGHT + 4) * prevIndex;
		const newScrollTop = newItemOffset - boxHeight + ITEM_HEIGHT;
		const totalItemsHeight = listFriends.length * ITEM_HEIGHT;
		const maxScrollTop = Math.max(totalItemsHeight - boxHeight, 0);

		boxRef.current.scroll({
			top: Math.min(Math.max(newScrollTop, 0), maxScrollTop),
			behavior: 'smooth',
		});

		setIdActive(newItem.id ?? '');
	};

	const handleEnter = (listFriends: FriendsEntity[], idActive: string) => {
		const selectedItem = listFriends.find((item) => item.id === idActive);
		if (!selectedItem) return;

		if (selectedItem.id === idActive) {
			handleSelectFriends(selectedItem.id);
		}
	};

	useEffect(() => {
		if (listFriends.length > 0) {
			setIdActive(listFriends[0].id);
		}
	}, [searchTerm]);

	return (
		<div
			onMouseDown={(e) => e.stopPropagation()}
			className="absolute top-[20px] left-0 dark:bg-bgPrimary bg-bgLightPrimary z-10 w-[440px] border border-slate-300 dark:border-none rounded shadow shadow-neutral-800"
			onClick={(e) => {
				e.stopPropagation();
			}}
		>
			<div className="cursor-default text-start">
				<div className="p-4">
					<h3 className="text-xl text-white">Select Friends</h3>
					<p className="text-textThreadPrimary pt-1">{`You can add ${friends.length} more friends.`}</p>
					<InputField
						type="text"
						placeholder="Type the username of a friend"
						className="h-[34px] dark:bg-bgTertiary bg-bgLightModeThird dark:text-textDarkTheme text-textLightTheme text-[16px] mt-[20px]"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						autoFocus={true}
					/>
				</div>
				{listFriends.length > 0 ? (
					<div ref={boxRef} className="w-full h-[190px] overflow-y-auto overflow-x-hidden thread-scroll">
						{listFriends.map((friend: IFriend, index) => (
							<div
								key={friend.id}
								onMouseEnter={() => setIdActive(friend.id ?? '')}
								onMouseLeave={() => setIdActive(friend.id ?? '')}
								className={`${idActive === friend.id ? 'dark:bg-bgModifierHover bg-bgLightModeThird' : ''} flex items-center h-10 px-2 ml-3 mr-2 py-[8px] rounded-[6px] cursor-pointer`}
							>
								<label className="flex flex-row items-center justify-between w-full gap-2 py-[3px] cursor-pointer">
									<div className="flex flex-row items-center gap-2">
										<AvatarImage
											alt={''}
											userName={friend.user?.username}
											src={friend.user?.avatar_url}
											className="size-8"
											classNameText="text-[9px] min-w-5 min-h-5 pt-[3px]"
										/>
										<span className={`text-base font-medium dark:text-white text-textLightTheme one-line`}>
											{friend.user?.display_name}
										</span>
										<span className="dark:text-colorNeutral text-colorTextLightMode font-medium">{friend.user?.username}</span>
									</div>
									<div className="relative flex flex-row justify-center">
										<input
											id={`checkbox-item-${index}`}
											type="checkbox"
											value={friend.id}
											checked={selectedFriends.includes(friend?.id || '')}
											onChange={handleCheckboxChange}
											className="peer appearance-none forced-colors:appearance-auto relative w-4 h-4 border dark:border-textPrimary border-gray-600 rounded-md focus:outline-none"
										/>
										<Icons.Check className="absolute invisible peer-checked:visible forced-colors:hidden w-4 h-4" />
									</div>
								</label>
							</div>
						))}
					</div>
				) : (
					<EmptySearchFriends />
				)}

				<div className="p-[20px]">
					<button
						disabled={selectedFriends.length === 0}
						onClick={handleCreateDM}
						className="h-[38px] w-full text-sm text-white dark:bg-buttonPrimary dark:hover:bg-bgSelectItemHover rounded"
					>
						{selectedFriends.length === 0 ? 'Create DM or Group Chat' : selectedFriends.length === 1 ? 'Create DM' : 'Create Group Chat'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default CreateMessageGroup;
