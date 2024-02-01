import React, { useState } from "react";
import * as Icons from "../../Icons";
import { Modal } from "@mezon/ui";
import { channelsActions, getStoreAsync, joinChanel } from "@mezon/store";
import { useAppDispatch } from "@mezon/store";
import { useNavigate } from "react-router-dom";
import { useAppNavigation, useChannelMembers, useChat } from "@mezon/core";
import { ApiCreateChannelDescRequest } from "vendors/mezon-js/packages/mezon-js/dist/api.gen";

interface ModalCreateDMProps {
    onClose: () => void;
    isOpen: boolean;
}

export function ModalCreateDM({ onClose, isOpen }: ModalCreateDMProps) {
    const dispatch = useAppDispatch();
    const { toDmGroupPage } = useAppNavigation();
    const navigate = useNavigate();

    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
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
    const [isCheck, setIsCheck] = useState<boolean>(false);
    const length: number = selectedFriends.length;
    const { members } = useChannelMembers({ channelId: "7bbf0581-fbbf-4b72-9560-e50c6593fda3" });
    const handleCreateDM = async () => {
        // console.log("Selected Friends:", selectedFriends);
        // console.log("started");
        const bodyCreateDmGroup: ApiCreateChannelDescRequest = {
            type: length > 1 ? 3 : 2,
            channel_private: 1,
            user_ids: selectedFriends,
        };
        console.log("bodycreate", bodyCreateDmGroup);
        const response = await dispatch(channelsActions.createNewChannel(bodyCreateDmGroup));
        const resPayload = response.payload as ApiCreateChannelDescRequest;

        console.log("response-channel", resPayload);
        if (resPayload.channel_id) {
            const directChat = toDmGroupPage(resPayload.channel_id);
            navigate(directChat);
        }
        setSelectedFriends([]);
    };

    const join = () => {
        console.log("joined");
        dispatch(joinChanel("64ec3a99-84a8-4d63-a711-f925bdb13f0a"));
    };

    const [searchTerm, setSearchTerm] = useState<string>("");
    // const [friends, setFriends] = useState<string[]>([
    //     "4f0ab1da-d153-4965-841d-b8d0123b645d",
    //     "a206e3ec-efe6-409c-a195-e133a76b445c",
    //     "e7766349-0e0b-40c2-ad02-603a74d23735",
    // ]);

    const [friends, setFriends] = useState<string[]>([
        "842b743e-7dc5-479c-aba8-1f174dd4e621",
        "4f0ab1da-d153-4965-841d-b8d0123b645d", // 
        "e7766349-0e0b-40c2-ad02-603a74d23735", // phongmm
    ]);

    const filteredFriends = friends.filter((friend) => friend.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="overflow-y-scroll flex-1 pt-3 space-y-[21px] h-32 flex flex-row justify-center text-gray-300 scrollbar-hide font-bold font-['Manrope']">
            <div className="flex flex-row items-center w-full gap-4 h-fit">
                <button onClick={join}>Join</button>
                <Modal title="Create DM" showModal={isOpen} onClose={onClose}>
                    <div>
                        <p className="pb-3">Select Friends</p>
                        <input
                            className="bg-gray-700 border  text-gray-900 text-sm rounded-lg  focus:border-blue-500 
                        block ps-10 p-2.5 w-[600px]  dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Search user"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <ul
                            className="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700 dark:text-gray-200"
                            aria-labelledby="dropdownSearchButton"
                        >
                            {filteredFriends.map((friend, index) => (
                                <li key={index}>
                                    <div className="flex items-center p-2 mt-2 rounded ">
                                        <input
                                            id={`checkbox-item-${index}`}
                                            type="checkbox"
                                            value={friend}
                                            className="w-4 h-4 border border-white cursor-pointer text-blue-600 bg-gray-100  rounded   dark:bg-gray-600 dark:border-gray-500"
                                            onChange={handleCheckboxChange}
                                        />
                                        <label
                                            htmlFor={`checkbox-item-${index}`}
                                            className="w-full ms-2 text-sm font-medium cursor-pointer text-white rounded"
                                        >
                                            {friend}
                                        </label>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button
                            // disabled={length === 0 && true}
                            onClick={handleCreateDM}
                            className="w-full bg-blue-700 py-2 disabled:cursor-not-allowed disabled:bg-blue-500"
                        >
                            CREATE DM/GROUP
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
