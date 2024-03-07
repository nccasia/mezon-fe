import { useAuth, useClans, useInvite } from '@mezon/core';
import { categoriesActions, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { InputField, ListMemberInvite, Modal as ModalInvite } from '@mezon/ui';
import { Dropdown, Modal } from 'flowbite-react';
import { useState } from 'react';
import { MdOutlineCreateNewFolder } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { ApiCreateCategoryDescRequest } from 'vendors/mezon-js/packages/mezon-js/dist/api.gen';
import * as Icons from '../Icons';
import ClanSetting from '../ClanSettings/clanSettings';
import { handleCopyToClipboard } from '../ChannelList';

export type ClanHeaderProps = {
	name?: string;
	type: string;
	bannerImage?: string;
};

function ClanHeader({ name, type, bannerImage }: ClanHeaderProps) {
	const dispatch = useAppDispatch();
	const { userProfile } = useAuth();
	const currentClanId = useSelector(selectCurrentClanId);
	const [openCreateCate, setOpenCreateCate] = useState(false);
	const [openInvite, setOpenInvite] = useState(false);
	const [openServerSettings, setOpenServerSettings] = useState(false);
	const { currentClan } = useClans();
	const { createLinkInviteUser } = useInvite();
	const [urlInvite, setUrlInvite] = useState('');

	const handleOpenInvite = () => {
		setOpenInvite(true);
		createLinkInviteUser(currentClan?.clan_id ?? '', '', 10).then((res) => {
			if (res && res.invite_link) {
				setUrlInvite(window.location.origin + '/invite/' + res.invite_link);
			}
		});
	};
	const onClose = () => {
		setOpenCreateCate(false);
		setOpenInvite(false);
	};
	const [nameCate, setNameCate] = useState('');

	const handleCreateCate = async () => {
		const body: ApiCreateCategoryDescRequest = {
			clan_id: currentClanId?.toString(),
			category_name: nameCate,
		};
		await dispatch(categoriesActions.createNewCategory(body));
		setNameCate('');
		onClose();
	};
	return (
		<>
			{type === 'direct' ? (
				<div className="px-3 border-b-1 border-bgPrimary font-title font-semibold text-white border-b-[#000] border-b-[1px] h-heightHeader flex items-center">
					<InputField
						type="text"
						placeholder="Find or start a conversation"
						className=" text-[14px] w-full bg-bgTertiary border-borderDefault h-[36px]"
					/>
				</div>
			) : (
				<div className={`${bannerImage ? 'h-[136px]' : 'h-[49px]'} relative`}>
					{bannerImage && <img src={bannerImage} alt="imageCover" className="h-full w-full" />}
					<div className="border-b border-borderDefault cursor-pointer w-[272px] p-3 left-0 top-0 absolute flex h-heightHeader justify-between items-center gap-2">
						<p className="text-white text-lg font-bold">{name?.toLocaleUpperCase()}</p>
						<Dropdown
							label=""
							className="bg-bgTertiary border-borderDefault text-contentPrimary p-2 w-[240px] text-[14px]"
							dismissOnClick={true}
							placement="bottom-end"
							renderTrigger={() => (
								<button className="w-6 h-8 relative flex flex-col justify-center">
									<Icons.ArrowDown />
								</button>
							)}
						>
							<Dropdown.Item
								icon={MdOutlineCreateNewFolder}
								theme={{
									base: 'hover:bg-hoverPrimary p-2 rounded-[5px] w-full flex items-center',
								}}
								onClick={() => setOpenCreateCate(true)}
							>
								Create Category
							</Dropdown.Item>
							<Dropdown.Item
								icon={MdOutlineCreateNewFolder}
								theme={{
									base: 'hover:bg-hoverPrimary p-2 rounded-[5px] w-full flex items-center',
								}}
								onClick={() => {
									setOpenInvite(true);
									handleOpenInvite();
								}}
							>
								Invite People
							</Dropdown.Item>
							{currentClan?.creator_id === userProfile?.user?.id && (
								<Dropdown.Item
									icon={MdOutlineCreateNewFolder}
									theme={{
										base: 'hover:bg-hoverPrimary p-2 rounded-[5px] w-full flex items-center',
									}}
									onClick={() => {
										setOpenServerSettings(true);
									}}
								>
									Server Settings
								</Dropdown.Item>
							)}
						</Dropdown>
					</div>
				</div>
			)}
			<ClanSetting
				// open={openServerSettings}
				open={openServerSettings}
				onClose={() => {
					setOpenServerSettings(false);
				}}
			/>
			<ModalInvite
				title="Invite friend"
				onClose={() => {
					setOpenInvite(false);
				}}
				showModal={openInvite}
				confirmButton={() => handleCopyToClipboard(urlInvite)}
				titleConfirm="Copy"
				subTitleBox="Send invite link to a friend"
				classSubTitleBox="ml-[-5px]"
				borderBottomTitle="border-b "
			>
				<div>
					<ListMemberInvite url={urlInvite} />
					<p className='pt-[10px]'>
						<span>{urlInvite}</span>
					</p>
				</div>
			</ModalInvite>
			<Modal show={openCreateCate} dismissible={true} onClose={onClose} className="bg-[#111111] text-contentPrimary" size="lg">
				<div className="bg-[#313338] flex items-center justify-between px-6 pt-4 border-solid border-borderDefault rounded-tl-[5px] rounded-tr-[5px]">
					<div className="text-[19px] font-[500]">Create Category</div>
					<button className="flex items-center justify-center opacity-50" onClick={onClose}>
						<span className="text-4xl">×</span>
					</button>
				</div>
				<Modal.Body className="bg-[#313338] px-6 py-4">
					<div className="flex flex-col">
						<span className="font-[600] text-[12px]">CATEGORY NAME</span>
						<InputField
							type="text"
							onChange={(e) => setNameCate(e.target.value)}
							placeholder="New Category"
							className="mb-6 py-[8px] bg-bgTertiary text-[14px]"
							value={nameCate}
						/>
					</div>
				</Modal.Body>
				<div className=" text-white font-semibold text-sm flex bg-bgTertiary justify-end flex-row items-center gap-4 py-4 px-6 bg-bgDisable rounded-bl-[5px] rounded-br-[5px]">
					<button onClick={onClose}>Cancel</button>
					<button
						className={`px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 bg-primary ${!nameCate.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
						onClick={handleCreateCate}
						disabled={!nameCate.trim()}
					>
						Create Category
					</button>
				</div>
			</Modal>
		</>
	);
}

export default ClanHeader;
