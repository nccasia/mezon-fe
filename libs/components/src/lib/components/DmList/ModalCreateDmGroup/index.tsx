import { useAppNavigation, useFriends } from '@mezon/core';
import { IFriend, directActions, selectTheme, useAppDispatch } from '@mezon/store';
import { Modal } from '@mezon/ui';
import { ChannelType } from 'mezon-js';
import { ApiCreateChannelDescRequest } from 'mezon-js/api.gen';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AvatarImage } from '../../AvatarImage/AvatarImage';
interface ModalCreateDMProps {
	onClose: () => void;
	isOpen: boolean;
}

export function ModalCreateDM({ onClose, isOpen }: ModalCreateDMProps) {
	const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
	const dispatch = useAppDispatch();
	const { toDmGroupPage } = useAppNavigation();
	const navigate = useNavigate();
	const { friends } = useFriends();
	const [length, setLength] = useState<number>(selectedFriends.length);
	const appearanceTheme = useSelector(selectTheme);
	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;

		setSelectedFriends((prevSelectedFriends) => {
			if (prevSelectedFriends.includes(value)) {
				return prevSelectedFriends.filter((friend) => friend !== value);
			} else {
				return [...prevSelectedFriends, value];
			}
		});
	};

	const handleCreateDM = async () => {
		const bodyCreateDmGroup: ApiCreateChannelDescRequest = {
			type: length > 1 ? ChannelType.CHANNEL_TYPE_GROUP : ChannelType.CHANNEL_TYPE_DM,
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
		setSelectedFriends([]);
		onClose();
	};

	const [searchTerm, setSearchTerm] = useState<string>('');
	// TODO: move to custom hook
	const filteredFriends = friends.filter((friend: IFriend) => friend.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()));

	useEffect(() => {
		setLength(selectedFriends.length);
	}, [selectedFriends]);

	const resetAndCloseModal = () => {
		setSelectedFriends([]);
		onClose();
	};

	return (
		<div className="overflow-y-scroll  flex-1 pt-3 space-y-[21px] h-32 flex flex-row justify-center text-gray-300 scrollbar-hide font-bold">
			<div className="flex flex-row items-center w-full gap-4 h-fit ">
				<Modal title="Create DM" showModal={isOpen} onClose={resetAndCloseModal}>
					<div className="bg-transparent w-full h-full">
						<p className="pb-3">Select Friends</p>
						<input
							className="bg-bgLightModeThird border font-thin text-sm rounded-lg border-[#adadad] focus:border-blue-500 focus:outline-none
                        block ps-10 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white text-black dark:focus:ring-blue-500 dark:focus:border-blue-500 w-full"
							placeholder="Search user"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							style={{ paddingLeft: '16px' }}
						/>
						<p className="text-sm font-medium my-[8px]">Add individual members by starting with @, or type a role name</p>
						<ul
							className={`h-[400px] pb-3 text-sm text-black dark:text-gray-200 max-h-[250px] overflow-y-scroll ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : ''}`}
							aria-labelledby="dropdownSearchButton"
						>
							{filteredFriends.map((friend, index) => (
								<li key={friend.id} className="dark:hover:bg-gray-700 rounded hover:bg-bgLightModeButton">
									<div className="flex text-black dark:text-white items-center py-2 my-2 rounded w-full">
										<input
											id={`checkbox-item-${index}`}
											type="checkbox"
											value={friend.id}
											className=""
											onChange={handleCheckboxChange}
										/>
										<label
											htmlFor={`checkbox-item-${index}`}
											className="w-full ms-2 text-sm font-medium cursor-pointer text-black dark:text-white rounded flex gap-2"
										>
											<AvatarImage 
												alt={friend.user?.username || ''}
												userName={friend.user?.username}
												className="min-w-5 min-h-5 max-w-5 max-h-5"
												classNameText='text-[9px] pt-[3px]'
												src={friend.user?.avatar_url}
											/>
											{friend.user?.display_name}
											<span className="dark:text-colorNeutral text-colorTextLightMode font-medium">
												{friend.user?.username}
											</span>
										</label>
									</div>
								</li>
							))}
						</ul>
						<button
							disabled={length === 0}
							onClick={handleCreateDM}
							className="w-full bg-blue-700 py-2 disabled:cursor-not-allowed disabled:bg-gray-500 rounded-lg dark:text-textDarkTheme text-textLightTheme"
						>
							{selectedFriends.length === 0
								? 'CREATE DM or GROUP CHAT'
								: selectedFriends.length === 1
									? 'CREATE DM'
									: 'CREATE GROUP CHAT'}
						</button>
					</div>
				</Modal>
			</div>
		</div>
	);
}
