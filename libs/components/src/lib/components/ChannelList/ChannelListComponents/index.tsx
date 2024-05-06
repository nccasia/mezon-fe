import { useState } from 'react';
import * as Icons from '../../Icons';
import EventModal from '../EventChannelModal';

export const Events = () => {
	const [showModal, setShowModal] = useState(false);

	const closeModal = () => {
		setShowModal(false);
	};

	const openModal = () => {
		setShowModal(true);
	};

	return (
		<>
			<div className="self-stretch inline-flex cursor-pointer" onClick={openModal}>
				<div className="grow w-5 flex-row h-5 items-center gap-2 flex">
					<div className="w-5 h-5 relative flex flex-row items-center">
						<div className="w-5 h-5 left-[1.67px] top-[1.67px] absolute">
							<Icons.EventIcon />
						</div>
					</div>
					<div className="w-[99px] text-zinc-400 text-base font-medium">3 Events</div>
				</div>
				<div className="w-5 h-5 p-2 bg-red-600 rounded-[50px] flex-col justify-center items-center flex">
					<div className="text-white text-xs font-medium">1</div>
				</div>
			</div>
			<EventModal open={showModal} onClose={closeModal} />
		</>
	);
};
