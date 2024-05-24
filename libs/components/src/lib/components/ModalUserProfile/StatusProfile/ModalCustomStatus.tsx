import { Icons } from '@mezon/components';
import { useAppDispatch, userClanProfileActions } from '@mezon/store';
import { Button, Dropdown, Label, Modal } from 'flowbite-react';
import { ReactNode, useEffect } from 'react';

type ModalCustomStatusProps = {
	name: string;
	openModal: boolean;
	onClose?: () => void;
};

const ModalCustomStatus = ({ openModal, name, onClose }: ModalCustomStatusProps) => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (openModal) {
			dispatch(userClanProfileActions.setShowModalFooterProfile(false));
		}
	}, [dispatch, openModal]);
	return (
		<Modal className="bg-bgModalDark" theme={{ content: { base: 'w-[440px]' } }} show={openModal} dismissible={true} onClose={onClose}>
			<div className="bg-bgPrimary pt-4 rounded">
				<div>
					<h1 className="text-white text-xl font-semibold text-center">Set a custom status</h1>
				</div>
				<form className="flex w-full flex-col gap-5 pt-4">
					<div className="px-4">
						<div className="mb-2 block">
							<Label value={`What's cookin', ${name}?`} className="text-[#B5BAC1] text-xs uppercase font-semibold" />
						</div>
						<input
							type="text"
							className="text-[#B5BAC1] outline-none w-full h-10 p-[10px] bg-[#26262B] text-base rounded placeholder:text-sm"
							placeholder="Support has arrived!"
						/>
					</div>
					<div className="px-4">
						<div className="mb-2 block">
							<Label htmlFor="clearAfter" value="Clear after" className="text-[#B5BAC1] text-xs uppercase font-semibold" />
						</div>
						<Dropdown
							trigger="click"
							dismissOnClick={false}
							renderTrigger={() => (
								<div className="flex items-center justify-between rounded-sm cursor-pointer h-9 bg-[#26262B] hover:[&>*]:text-[#fff] px-3">
									<li className="text-[14px] text-[#B5BAC1] w-full py-[6px] list-none select-none">Today</li>
									<Icons.ArrowDown defaultFill="#fff" />
								</div>
							)}
							label=""
							placement="bottom-start"
							className="bg-[#232428] border-none py-0 w-[200px] [&>ul]:py-0"
						>
							<ItemSelect children="Today" />
							<ItemSelect children="4 hours" />
							<ItemSelect children="1 hours" />
							<ItemSelect children="30 minutes" />
							<ItemSelect children="Don't clear" />
						</Dropdown>
					</div>
					<div className="px-4">
						<div className="mb-2 block">
							<Label htmlFor="status" value="Status" className="text-[#B5BAC1] text-xs uppercase font-semibold" />
						</div>
						<Dropdown
							trigger="click"
							dismissOnClick={false}
							renderTrigger={() => (
								<div className="flex items-center justify-between rounded-sm h-9 bg-[#26262B] hover:[&>*]:text-[#fff] px-3">
									<li className="text-[14px] text-[#B5BAC1] w-full py-[6px] cursor-pointer list-none select-none">Today</li>
									<Icons.ArrowDown defaultFill="#fff" />
								</div>
							)}
							label=""
							placement="bottom-start"
							className="bg-[#232428] border-none py-0 w-[200px] [&>ul]:py-0"
						>
							<ItemSelect children="Online" startIcon={<Icons.OnlineStatus />} />
							<ItemSelect children="Idle" startIcon={<Icons.DarkModeIcon className="text-[#F0B232] -rotate-90" />} />
							<ItemSelect children="Do Not Disturb" startIcon={<Icons.MinusCircleIcon />} />
							<ItemSelect children="Invisible" startIcon={<Icons.OfflineStatus />} />
						</Dropdown>
					</div>
					<div className="flex justify-end p-4 rounded-b bg-[#2B2D31]">
						<Button
							className="h-10 px-4 rounded bg-transparent dark:bg-transparent hover:!bg-transparent hover:!underline focus:!ring-transparent"
							type="button"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button
							className="h-10 px-4 rounded bg-bgSelectItem dark:bg-bgSelectItem hover:!bg-bgSelectItemHover focus:!ring-transparent"
							type="submit"
						>
							Save
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
};

type ItemSelectProps = {
	children: string;
	dropdown?: boolean;
	startIcon?: ReactNode;
	onClick?: () => void;
};

const ItemSelect = ({ children, dropdown, startIcon, onClick }: ItemSelectProps) => {
	return (
		<div
			onClick={onClick}
			className="flex items-center justify-between h-11 rounded-sm bg-[#26262B] cursor-pointer  hover:bg-zinc-700 hover:[&>li]:text-[#fff] px-3"
		>
			{startIcon && <div className="flex items-center justify-center h-[18px] w-[18px] mr-2">{startIcon}</div>}
			<li className="text-[14px] text-[#B5BAC1] w-full list-none leading-[44px]">{children}</li>
			<Icons.Check className="w-[18px] h-[18px" />
		</div>
	);
};

export default ModalCustomStatus;
