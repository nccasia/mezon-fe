import { useAppNavigation, useClans } from '@mezon/core';
import { selectAllAccount } from '@mezon/store';
import { InputField, Modal } from '@mezon/ui';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import * as Icons from '../Icons';

export type ModalCreateClansProps = {
	open: boolean;
	onClose: () => void;
};

const ModalCreateClans = (props: ModalCreateClansProps) => {
	const { open, onClose } = props;
	const [urlImage, setUrlImage] = useState('');
	const [nameClan, setNameClan] = useState('');
	const { navigate, toClanPage } = useAppNavigation();
	const { createClans } = useClans();
	const userProfile = useSelector(selectAllAccount);
	const handleFile = (e: any) => {
		const fileToStore: File = e.target.files[0];
		setUrlImage(URL.createObjectURL(fileToStore));
	};
	const handleCreateClan = () => {
		// TODO: validate
		if (nameClan) {
			createClans(nameClan, '').then((res) => {
				if (res && res.clan_id) {
					navigate(toClanPage(res.clan_id || ''));
				}
			});
		}
	};
	const handleClose = () => {
		onClose();
		setUrlImage('');
		setNameClan('');
	};

	return (
		<Modal
			showModal={open}
			onClose={handleClose}
			title=""
			titleConfirm="Create"
			confirmButton={handleCreateClan}
			disableButtonConfirm={!nameClan ? true : false}
			classNameBox="h-full"
		>
			<div className="flex items-center flex-col justify-center ">
				<span className="text-contentPrimary text-2xl pb-4 font-[700] leading-8 tracking-wider">Customize Your Server</span>
				<p className="text-contentTertiary  text-center text-xl leading-6 font-[400]">
					Give your new clan a personality with a name and an icon. You can always change it later.
				</p>
				<label className="block mt-8 mb-4">
					{urlImage ? (
						<img id="preview_img" className="h-[81px] w-[81px] object-cover rounded-full" src={urlImage} alt="Current profile" />
					) : (
						<div
							id="preview_img"
							className="h-[81px] w-[81px] flex justify-center items-center flex-col bg-bgSecondary border-white relative border-[1px] border-dashed rounded-full cursor-pointer transform hover:scale-105 transition duration-300 ease-in-out"
						>
							<div className="absolute right-0 top-[-3px] left-[54px]">
								<Icons.AddIcon />
							</div>
							<Icons.UploadImage />
							<span className="text-[14px] text-contentPrimary font-bold text-sm tracking-wide">UPLOAD</span>
						</div>
					)}
					<input id="preview_img" type="file" onChange={(e) => handleFile(e)} className="block w-full text-sm text-slate-500 hidden" />
				</label>
				<div className="w-full">
					<span className="font-[700] text-[16px] leading-6 text-contentPrimary">CLAN NAME</span>
					<InputField
						onChange={(e) => setNameClan(e.target.value)}
						type="text"
						className="bg-bgSurface mb-2 mt-4 py-3"
						placeholder={`${userProfile?.user?.username}'s clan`}
					/>
					<span className="text-[14px] text-contentTertiary">
						By creating a clan, you agree to Mezon’s <span className="text-contentBrandLight">Communnity Guidelines</span>.
					</span>
				</div>
			</div>
		</Modal>
	);
};

export default ModalCreateClans;
