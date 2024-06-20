import { useAppNavigation, useAppParams, useClans } from '@mezon/core';
import { selectCurrentClanId, selectNumberEvent } from '@mezon/store';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as Icons from '../../Icons';
import EventModal from '../EventChannelModal';

export const Events = () => {
	const { toMembersPage } = useAppNavigation();
	const { currentURL } = useAppParams();
	const numberEventManagement = useSelector(selectNumberEvent);
	const { showNumEvent, setClanShowNumEvent } = useClans();

	const currentClanId = useSelector(selectCurrentClanId);

	const [showModal, setShowModal] = useState(false);

	const closeModal = () => {
		setShowModal(false);
	};

	const openModal = () => {
		setShowModal(true);
		setClanShowNumEvent(false);
	};

	const memberPath = toMembersPage(currentClanId || '');

	return (
		<>
			<div
				className="self-stretch  items-center inline-flex cursor-pointer px-2 rounded h-[34px] dark:hover:bg-bgModifierHover hover:bg-bgLightModeButton"
				onClick={openModal}
			>
				<div className="grow w-5 flex-row items-center gap-2 flex">
					<div className="w-5 h-5 relative flex flex-row items-center">
						<div className="w-5 h-5 left-[1.67px] top-[1.67px] absolute">
							<Icons.IconEvents />
						</div>
					</div>
					<div className="w-[99px] dark:text-zinc-400 text-colorTextLightMode text-base font-medium">
						{numberEventManagement === 0 && 'Events'}
						{numberEventManagement === 1 && '1 Event'}
						{numberEventManagement > 1 && `${numberEventManagement} Events`}
					</div>
				</div>
				{numberEventManagement !== 0 && showNumEvent && (
					<div className="w-5 h-5 p-2 bg-red-600 rounded-[50px] flex-col justify-center items-center flex">
						<div className="text-white text-xs font-medium">{numberEventManagement}</div>
					</div>
				)}
			</div>

			<Link
				to={memberPath}
				className={`self-stretch inline-flex cursor-pointer px-2 rounded h-[34px] ${currentURL === memberPath ? 'dark:bg-bgModifierHover bg-bgModifierHoverLight' : ''} dark:hover:bg-bgModifierHover hover:bg-bgModifierHoverLight`}
			>
				<div className="grow w-5 flex-row items-center gap-2 flex">
					<div className="w-5 h-5 relative flex flex-row items-center">
						<div className="w-5 h-5 left-[1.67px] top-[1.67px] absolute">
							<Icons.MemberList defaultSize="w-5 h-5" />
						</div>
					</div>
					<div className="w-[99px] dark:text-zinc-400 text-colorTextLightMode text-base font-medium">Members</div>
				</div>
			</Link>
			{showModal && <EventModal onClose={closeModal} numberEventManagement={numberEventManagement} />}
		</>
	);
};
