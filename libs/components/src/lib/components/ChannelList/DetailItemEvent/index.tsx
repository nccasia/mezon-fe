import { selectChooseEvent } from '@mezon/store';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import EventInfoDetail from './EventInfo';
import InterestedDetail from './InterestedDetail';

enum tabs {
	event = 'Events',
	interest = 'Interested',
}

type DetailItemEventProps = {
	setOpenModalDetail: (status: boolean) => void;
};

const DetailItemEvent = (props: DetailItemEventProps) => {
	const { setOpenModalDetail } = props;
	const [currentTab, setCurrentTab] = useState('Events');
	const chooseEvent = useSelector(selectChooseEvent);

	return (
		<div className="relative w-full max-w-[600px]">
			<div className="rounded-lg overflow-hidden text-sm dark:bg-[#313339] bg-white dark:text-white text-black">
				{chooseEvent?.logo && <img src={chooseEvent?.logo} alt={chooseEvent?.title} className="w-full h-44 object-cover" />}
				<div className="flex justify-between items-center pt-4 border-b border-zinc-600">
					<div className="flex items-center gap-x-4 ml-4">
						<div className="gap-x-6 flex items-center">
							<h4
								className={`pb-4 font-semibold ${currentTab === tabs.event ? 'dark:text-white text-black border-b border-white' : 'text-zinc-400'}`}
								onClick={() => setCurrentTab(tabs.event)}
							>
								Events
							</h4>
							<h4
								className={`pb-4 font-semibold ${currentTab === tabs.interest ? 'dark:text-white text-black border-b border-white' : 'text-zinc-400'}`}
								onClick={() => setCurrentTab(tabs.interest)}
							>
								Interested
							</h4>
						</div>
					</div>
					<span
						className="text-5xl leading-3 dark:hover:text-white hover:text-black mr-4 -mt-[14px]"
						onClick={() => setOpenModalDetail(false)}
					>
						×
					</span>
				</div>
				{currentTab === tabs.event && <EventInfoDetail event={chooseEvent} />}
				{currentTab === tabs.interest && <InterestedDetail userID={chooseEvent?.creator_id} />}
			</div>
		</div>
	);
};

export default DetailItemEvent;
