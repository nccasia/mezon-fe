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

	// TODO: using modal component
	if (!showModal) return null;

	return (
		<div
			ref={modalRef}
			className="flex w-64 flex-col text-[16px] px-3 py-2 gap-2 z-50 border-[1px] border-bg-bgSecondary
         border-borderDefault bg-bgSecondary rounded-lg"
		>
			<div className="overflow-y-auto max-h-36">
				{options.map((option: IClan, index) => (
					<div
						className={`w-auto flex py-1 px-2 items-center cursor-pointer justify-between rounded-md ${idSelectedClan === option.id ? 'bg-[#151C2B] text-contentPrimary font-bold' : 'text-contentSecondary'}`}
						key={index}
						onClick={() => onChangeClan(option.id)}
					>
						<div className="flex items-center gap-4 w-10/12">
							{option.logo ? (
								<img src={option.logo} width={40} height={40} className="rounded-full" />
							) : (
								<div>
									{option?.clan_name && (
										<div className="w-[40px] h-[40px] bg-bgSurface rounded-full flex justify-center items-center text-contentSecondary text-[20px]">
											{option.clan_name.charAt(0).toUpperCase()}
										</div>
									)}
								</div>
							)}
							<span className="text-[16px]">{option.clan_name}</span>
						</div>
						{idSelectedClan === option.clan_id && <Tick />}
					</div>
				))}
			</div>
			<div className="w-auto flex py-1 px-2 items-center justify-between text-contentSecondary rounded-md cursor-pointer">
				<div className="flex items-center gap-4 w-10/12" onClick={createClan}>
					<img src={'/assets/images/icon-create-clan.svg'} alt={'logoMezon'} width={40} height={40} />
					<span className="text-[16px]">Add Clan</span>
				</div>
			</div>
		</div>
	);
};

export default ModalListClans;
