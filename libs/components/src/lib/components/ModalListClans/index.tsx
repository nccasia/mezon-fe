import { useEscapeKey, useThreads } from '@mezon/core';
import { IClan } from '@mezon/utils';
import { useEffect, useRef } from 'react';
import { Tick } from '../Icons';

export type ModalListClansProps = {
	showModal: boolean;
	options: IClan[];
	idSelectedClan?: string | null;
	onChangeClan: (clanId: string) => void;
	createClan: () => void;
	onClose: () => void;
};

const ModalListClans = (props: ModalListClansProps) => {
	const { showModal, options, idSelectedClan, onChangeClan, createClan, onClose } = props;
	const modalRef = useRef<HTMLDivElement>(null);
	const { setTurnOffThreadMessage } = useThreads();

	const handleClickOutside = (event: MouseEvent) => {
		if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
			onClose();
		}
	};

	useEffect(() => {
		if (showModal) {
			document.addEventListener('mousedown', handleClickOutside);
		} else {
			document.removeEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showModal]);

	useEffect(() => {
		const activeClanIndex = options.findIndex((option) => option.id === idSelectedClan);
		if (activeClanIndex !== -1) {
			const activeClan = options[activeClanIndex];
			options.splice(activeClanIndex, 1);
			options.unshift(activeClan);
		}
	}, [idSelectedClan]);

	useEscapeKey(onClose);

	// TODO: using modal component
	if (!showModal) return null;

	return (
		<div
			ref={modalRef}
			className="flex w-64 flex-col text-[16px] px-3 py-2 gap-2 z-50 border-[1px] border-bg-bgSecondary
         dark:border-borderDefault border-[#E1E1E1] dark:bg-bgProfileBody bg-[#F0F0F0] duration-100 rounded"
		>
			<div className="overflow-y-auto max-h-36 hide-scrollbar">
				{options.map((option: IClan) => {
					return (
						<button
							className={`w-full  flex py-1 px-2 items-center cursor-pointer justify-between rounded-md ${idSelectedClan === option.id ? 'dark:bg-[#151C2B] bg-bgLightModeButton duration-100 dark:text-contentPrimary text-black font-bold' : 'dark:text-contentSecondary text-[#323232]'}`}
							key={option.id}
							onClick={() => {onChangeClan(option.id); setTurnOffThreadMessage();}}
						>
							<div className="flex items-center gap-4 w-10/12">
								{option.logo ? (
									<img src={option.logo} alt={option.logo} className="rounded-full size-10 object-cover" />
								) : (
									<div>
										{option?.clan_name && (
											<div className="w-[40px] h-[40px] dark:bg-bgSurface bg-white rounded-full flex justify-center items-center dark:text-contentSecondary text-textLightTheme text-[20px]">
												{option.clan_name.charAt(0).toUpperCase()}
											</div>
										)}
									</div>
								)}
								<span className="text-[16px] one-line">{option.clan_name}</span>
							</div>
							{idSelectedClan === option.clan_id && <Tick />}
						</button>
					);
				})}
			</div>
			<div className="w-auto flex py-1 px-2 items-center justify-between text-contentSecondary rounded-md cursor-pointer hover:bg-bgLightModeButton group">
				<button className="flex items-center gap-4 w-10/12" onClick={createClan}>
					<div className="dark:bg-bgPrimary bg-[#E1E1E1] flex justify-center items-center rounded-full cursor-pointer dark:group-hover:bg-slate-800 group-hover:bg-bgLightModeButton  transition-all duration-200 size-10">
						<p className="text-2xl font-bold text-[#155EEF]">+</p>
					</div>
					<span className="text-[16px] dark:text-contentPrimary text-black">Add Clan</span>
				</button>
			</div>
		</div>
	);
};

export default ModalListClans;
