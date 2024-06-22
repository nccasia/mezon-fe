import { Icons } from '@mezon/components';
import { useAuth, useChannels, useSendForwardMessage } from '@mezon/core';
import { RootState, channelsActions, selectAllDirectMessages, selectTheme, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { ChannelStatusEnum, removeDuplicatesById } from '@mezon/utils';
import { Button, Checkbox, Label, Modal } from 'flowbite-react';
import { getSelectedMessage, toggleIsShowPopupForwardFalse } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import MessageContent from '../MessageWithUser/MessageContent';
type ModalParam = {
	openModal: boolean;
	onClose: () => void;
};
type OpjectSend = {
	id: string;
	type: number;
	clanId?: string;
	channel_label?: string;
};
const ForwardMessageModal = ({ openModal, onClose }: ModalParam) => {
	const appearanceTheme = useSelector(selectTheme);
	const dispatch = useAppDispatch();
	const dmGroupChatList = useSelector(selectAllDirectMessages);
	const { listChannels } = useChannels();
	const isLoading = useSelector((state: RootState) => state.channels.loadingStatus);
	const listGroup = dmGroupChatList.filter((groupChat) => groupChat.type === 2);
	const listDM = dmGroupChatList.filter((groupChat) => groupChat.type === 3);
	const { sendForwardMessage } = useSendForwardMessage();
	const mezon = useMezon();
	const { userProfile } = useAuth();
	const selectedMessage = useSelector(getSelectedMessage);
	const accountId = userProfile?.user?.id ?? '';

	const [selectedObjectIdSends, setSelectedObjectIdSends] = useState<OpjectSend[]>([]);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		if (isLoading === 'loaded') {
			dispatch(channelsActions.openCreateNewModalChannel(false));
		}
	}, [dispatch, isLoading]);

	const handleCloseModal = () => {
		dispatch(toggleIsShowPopupForwardFalse());
	};
	const handleToggle = (id: string, type: number, clanId?: string, channel_label?: string) => {
		const existingIndex = selectedObjectIdSends.findIndex((item) => item.id === id && item.type === type);
		if (existingIndex !== -1) {
			setSelectedObjectIdSends((prevItems) => [...prevItems.slice(0, existingIndex), ...prevItems.slice(existingIndex + 1)]);
		} else {
			setSelectedObjectIdSends((prevItems) => [...prevItems, { id, type, clanId, channel_label }]);
		}
	};

	const sentToMessage = async () => {
		for (const selectedObjectIdSend of selectedObjectIdSends) {
			if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_DM) {
				sendForwardMessage('', selectedObjectIdSend.id, ChannelStreamMode.STREAM_MODE_DM, selectedMessage);
			} else if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_GROUP) {
				sendForwardMessage('', selectedObjectIdSend.id, ChannelStreamMode.STREAM_MODE_GROUP, selectedMessage);
			} else if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_TEXT) {
				sendForwardMessage(
					selectedObjectIdSend.clanId || '',
					selectedObjectIdSend.id,
					ChannelStreamMode.STREAM_MODE_CHANNEL,
					selectedMessage,
				);
			}
		}
		dispatch(toggleIsShowPopupForwardFalse());
	};

	const listMemSearch = useMemo(() => {
		const listDMSearch = listDM.length
			? listDM.map((itemDM: any) => {
					return {
						id: itemDM?.user_id[0] ?? '',
						name: itemDM?.channel_label ?? '',
						avatarUser: itemDM?.channel_avatar[0] ?? '',
						idDM: itemDM?.id ?? '',
						typeChat: 3,
					};
				})
			: [];
		const listGroupSearch = listGroup.length
			? listGroup.map((itemGr: any) => {
					return {
						id: itemGr?.channel_id ?? '',
						name: itemGr?.channel_label ?? '',
						avatarUser: 'assets/images/avatar-group.png' ?? '',
						idDM: itemGr?.id ?? '',
						typeChat: 2,
					};
				})
			: [];

		const listSearch = [...listDMSearch, ...listGroupSearch];
		return removeDuplicatesById(listSearch.filter((item) => item.id !== accountId));
	}, [accountId, listDM, listGroup]);

	const listChannelSearch = useMemo(() => {
		const list = listChannels.map((item) => {
			return {
				id: item?.id ?? '',
				name: item?.channel_label ?? '',
				subText: item?.category_name ?? '',
				icon: '#',
				type: item?.type ?? '',
				clanId: item?.clan_id ?? '',
				channel_label: item?.channel_label ?? '',
			};
		});
		return list;
	}, [listChannels]);

	const isNoResult =
		!listChannelSearch.filter((item) => item.name.indexOf(searchText) > -1).length &&
		!listMemSearch.filter((item: any) => item.name.indexOf(searchText) > -1).length;

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
		}
	};

	return (
		<Modal className="bg-bgModalDark" theme={{ content: { base: 'w-[550px]' } }} show={openModal} dismissible={true} onClose={onClose}>
			<div className="dark:bg-bgSecondary bg-bgLightMode pt-4 rounded">
				<div>
					<h1 className="dark:text-white text-textLightTheme text-xl font-semibold text-center">Forward Message</h1>
				</div>
				<div className="px-4 pt-4">
					<input
						type="text"
						className="dark:text-[#B5BAC1] text-textLightTheme outline-none w-full h-10 p-[10px] dark:bg-bgTertiary bg-bgModifierHoverLight text-base rounded placeholder:text-sm"
						placeholder="Search"
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={(e) => handleInputKeyDown(e)}
					/>
					<div className={`mt-4 mb-2 overflow-y-auto h-[300px] ${appearanceTheme === 'light' ? 'customScrollLightMode' : 'thread-scroll'}`}>
						{!searchText.startsWith('@') && !searchText.startsWith('#') ? (
							<>
								{listMemSearch.length
									? listMemSearch
											.filter((item: any) => item.name.toUpperCase().indexOf(searchText.toUpperCase()) > -1)
											.slice(0, 7)
											.map((item: any) => (
												<div
													key={item.id}
													className="flex items-center px-4 py-1 dark:hover:bg-bgPrimary1 hover:bg-bgLightModeThird rounded"
												>
													<div className="flex flex-1 flex-row items-center">
														<img
															src={item.avatarUser}
															alt=""
															className="size-5 object-cover rounded-full mr-[10px] my-[5px]"
														/>
														<p className="dark:text-[#B5BAC1] text-textLightTheme">{item.name}</p>
													</div>
													<Checkbox
														className="w-4 h-4 focus:ring-transparent"
														id={`checkbox-item-${item.idDM}`}
														onChange={() => handleToggle(item.idDM, item.typeChat || 0)}
													/>
												</div>
											))
									: null}
								{listChannelSearch.length
									? listChannelSearch
											.filter((item) => item.name.toUpperCase().indexOf(searchText.toUpperCase()) > -1)
											.slice(0, 8)
											.map((channel: any) => {
												return (
													<div
														key={channel.id}
														className="flex items-center px-4 py-1 dark:hover:bg-bgPrimary1 hover:bg-bgLightModeThird rounded"
													>
														<div className="flex flex-1 flex-row items-center gap-1">
															{channel.channel_private === ChannelStatusEnum.isPrivate ? (
																<Icons.HashtagLocked defaultSize="size-5 min-w-5 min-h-5" />
															) : (
																<Icons.Hashtag defaultSize="size-5 min-w-5 min-h-5" />
															)}
															<p className="dark:text-[#B5BAC1] text-textLightTheme">{channel.name}</p>
														</div>
														<Checkbox
															className="w-4 h-4 focus:ring-transparent"
															id={`checkbox-item-${channel.id}`}
															onChange={() =>
																handleToggle(
																	channel.id,
																	channel.type || 0,
																	channel.clanId,
																	channel.channel_label || '',
																)
															}
														/>
													</div>
												);
											})
									: null}
								{isNoResult && <span className=" flex flex-row justify-center">Can't seem to find what you're looking for?</span>}
							</>
						) : (
							<>
								{searchText.startsWith('@') && (
									<>
										<span className="text-textPrimary text-left opacity-60 text-[11px] pb-1 uppercase">
											Search friend and users
										</span>
										{listMemSearch.length ? (
											listMemSearch
												.filter((item: any) => item.name.toUpperCase().indexOf(searchText.toUpperCase().substring(1)) > -1)
												.slice(0, 25)
												.map((item: any) => {
													return (
														<div
															key={item.id}
															className="flex items-center px-4 py-1 dark:hover:bg-bgPrimary1 hover:bg-bgLightModeThird rounded"
														>
															<div className="flex flex-1 flex-row items-center">
																<img
																	src={item.avatarUser}
																	alt=""
																	className="size-5 object-cover rounded-full mr-[10px] my-[5px]"
																/>
																<p className="dark:text-[#B5BAC1] text-textLightTheme">{item.name}</p>
															</div>
															<Checkbox
																className="w-4 h-4 focus:ring-transparent"
																id={`checkbox-item-${item.id}`}
																onChange={() => handleToggle(item.idDM, item.typeChat || 0)}
															/>
														</div>
													);
												})
										) : (
											<></>
										)}
									</>
								)}
								{searchText.startsWith('#') && (
									<>
										<span className="text-left opacity-60 text-[11px] pb-1 uppercase">Searching channel</span>
										{listChannelSearch.length ? (
											listChannelSearch
												.filter((item) => item.name.toUpperCase().indexOf(searchText.toUpperCase().substring(1)) > -1)
												.slice(0, 25)
												.map((channel: any) => {
													return (
														<div
															key={channel.id}
															className="flex items-center px-4 py-1 dark:hover:bg-bgPrimary1 hover:bg-bgLightModeThird rounded"
														>
															<div className="flex flex-1 flex-row items-center gap-1">
																{channel.channel_private === ChannelStatusEnum.isPrivate ? (
																	<Icons.HashtagLocked defaultSize="size-5 min-w-5 min-h-5" />
																) : (
																	<Icons.Hashtag defaultSize="size-5 min-w-5 min-h-5" />
																)}
																<p className="dark:text-[#B5BAC1] text-textLightTheme">{channel.name}</p>
															</div>
															<Checkbox
																className="w-4 h-4 focus:ring-transparent"
																id={`checkbox-item-${channel.id}`}
																onChange={() =>
																	handleToggle(
																		channel.id,
																		channel.type || 0,
																		channel.clanId,
																		channel.channel_label || '',
																	)
																}
															/>
														</div>
													);
												})
										) : (
											<></>
										)}
									</>
								)}
							</>
						)}
					</div>
				</div>
				<div className="px-4">
					<div className="mb-2 block">
						<Label htmlFor="clearAfter" value="Shared content" className="dark:text-[#B5BAC1] text-xs uppercase font-semibold" />
					</div>
					<div
						className={`h-20 overflow-y-auto dark:bg-bgProfileBody bg-bgLightModeThird p-[5px] rounded ${appearanceTheme === 'light' ? 'customScrollLightMode' : 'thread-scroll'}`}
					>
						<MessageContent message={selectedMessage} newMessage="" />
					</div>
					<div className="flex justify-end p-4 rounded-b gap-4">
						<Button
							className="h-10 px-4 rounded dark:bg-slate-500 bg-slate-500 hover:!underline focus:ring-transparent"
							type="button"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button
							onClick={() => sentToMessage()}
							className="h-10 px-4 rounded dark:bg-bgSelectItem bg-bgSelectItem hover:!bg-bgSelectItemHover focus:ring-transparent"
						>
							Send
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};
export default ForwardMessageModal;
