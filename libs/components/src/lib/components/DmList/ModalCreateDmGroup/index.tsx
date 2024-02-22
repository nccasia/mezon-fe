import { useAppNavigation, useFriends } from '@mezon/core';
import { IFriend, directActions, useAppDispatch } from '@mezon/store';
import { Modal } from '@mezon/ui';
import { ChannelTypeEnum } from '@mezon/utils';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiCreateChannelDescRequest } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';
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
			type: length > 1 ? ChannelTypeEnum.GROUP_CHAT : ChannelTypeEnum.DM_CHAT,
			channel_private: 1,
			user_ids: selectedFriends,
		};

		const response = await dispatch(directActions.createNewDirectMessage(bodyCreateDmGroup));
		const resPayload = response.payload as ApiCreateChannelDescRequest;
		if (resPayload.channel_id) {
			await dispatch(
				directActions.joinDirectMessage({
					directMessageId: resPayload.channel_id,
					channelName: resPayload.channel_lable,
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
		<div className="overflow-y-scroll  flex-1 pt-3 space-y-[21px] h-32 flex flex-row justify-center text-gray-300 scrollbar-hide font-bold font-['Manrope']">
			<div className="flex flex-row items-center w-full gap-4 h-fit ">
				<Modal title="Create DM" showModal={isOpen} onClose={resetAndCloseModal}>
					<div className="bg-transparent w-full h-full">
						<p className="pb-3">Select Friends</p>
						<input
							className="bg-black border font-thin text-white text-sm rounded-lg border-[#1E1E1E] focus:border-blue-500 focus:outline-none
                        block ps-10 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-full"
							placeholder="Search user"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							style={{ paddingLeft: '16px' }}
						/>
						<p className="text-sm font-medium my-[8px]">Add individual members by starting with @, or type a role name</p>
						<ul
							className="h-[400px] pb-3 text-sm text-gray-700 dark:text-gray-200 max-h-[250px] overflow-y-scroll"
							aria-labelledby="dropdownSearchButton"
						>
							{filteredFriends.map((friend, index) => (
								<li key={index}>
									<div className="flex items-center py-2 my-2 rounded w-full">
										<input
											id={`checkbox-item-${index}`}
											type="checkbox"
											value={friend.id}
											className="peer relative appearance-none w-5 h-5 border rounded-sm focus:outline-none checked:bg-gray-300"
											onChange={handleCheckboxChange}
										/>
										<label
											htmlFor={`checkbox-item-${index}`}
											className="w-full ms-2 text-sm font-medium cursor-pointer text-white rounded"
										>
											{friend.user?.username}
										</label>
									</div>
								</li>
							))}
						</ul>
						<button
							disabled={length === 0}
							onClick={handleCreateDM}
							className="w-full bg-blue-700 py-2 disabled:cursor-not-allowed disabled:bg-gray-500"
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
