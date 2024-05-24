import { selectVoiceChannelAll } from '@mezon/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import EventInfoModal from './eventInfoModal';
import LocationModal from './locationModal';
import ReviewModal from './reviewModal';
import { useClans, useEventManagement } from '@mezon/core';

enum Tabs_Option {
	LOCATION = 0,
	EVENT_INFO = 1,
	REVIEW = 2,
}

enum OptionEvent {
	OPTION_SPEAKER = 'Speaker',
	OPTION_LOCATION = 'Location',
}

export type ModalCreateProps = {
	onClose: () => void;
	onCloseEventModal: () => void;
};

const ModalCreate = (props: ModalCreateProps) => {
	const { onClose, onCloseEventModal } = props;
	const [currentModal, setCurrentModal] = useState(0);
	const [topic, setTopic] = useState('');
	const [timeStart, setTimeStart] = useState('00:00');
	const [timeEnd, setTimeEnd] = useState('00:00');
	const [selectedDateStart, setSelectedDateStart] = useState<Date>(new Date());
	const [selectedDateEnd, setSelectedDateEnd] = useState<Date>(new Date());
	const [voiceChannel, setVoiceChannel] = useState('');
	const [buttonWork, setButtonWork] = useState(true);
	const [titleEvent, setTitleEvent] = useState('');
	const [option, setOption] = useState('');
	const [logo, setLogo] = useState('');
	const [description, setDescription] = useState('');
	const { createEventManagement } = useEventManagement();
	const { currentClanId } = useClans();

	const voicesChannel = useSelector(selectVoiceChannelAll);
	const tabs = ['Location', 'Event Info', 'Review'];

	const handleNext = (currentModal: number) => {
		if (buttonWork && currentModal < tabs.length - 1) {
			setCurrentModal(currentModal + 1);
		}
	};

	const handleBack = (currentModal: number) => {
		setCurrentModal(currentModal - 1);
	};

	const handleTopic = (topic: string) => {
		setTopic(topic);
	};

	const handleTimeStart = (time: string) => {
		setTimeStart(time);
	};

	const handleTimeEnd = (time: string) => {
		setTimeEnd(time);
	};

	const handleVoiceChannel = (channel: string) => {
		setVoiceChannel(channel);
	};

	const handleOption = (option: string) => {
		setOption(option);
	};

	const handleTitleEvent = (title: string) => {
		setTitleEvent(title);
	};

	const handleCurrentModal = (number: number) => {
		if (buttonWork || number < 1) {
			setCurrentModal(number);
		}
	};

	const handleDescription = (content: string) => {
		setDescription(content);
	}

	const handleSubmit = async ()=>{

		const voice = option === OptionEvent.OPTION_SPEAKER ? voiceChannel : '';
		const title = option === OptionEvent.OPTION_LOCATION ? titleEvent : '';

		const timeValueStart = handleTimeISO(selectedDateStart, timeStart);
		const timeValueEnd = handleTimeISO(selectedDateStart, timeEnd);

		if(!timeValueEnd){
			await createEventManagement(currentClanId || '', voice, title, topic, timeValueStart, timeValueStart, description, logo);
			hanldeCloseModal();
			return;
		}
		await createEventManagement(currentClanId || '', voice, title, topic, timeValueStart, timeValueEnd, description, logo);
		hanldeCloseModal();
	}

	const hanldeCloseModal = () =>{
		onClose();
		onCloseEventModal();
	}

	const handleTimeISO = (fullDateStr: Date, timeStr: string)=>{
		const date = new Date(fullDateStr);

		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
		const day = date.getDate().toString().padStart(2, '0');

		const [hours, minutes] = timeStr.split(':').map(Number);
		const isoDate = new Date(Date.UTC(year, Number(month) - 1, Number(day), hours, minutes));

		return isoDate.toISOString();
	}

	useEffect(() => {
		if (currentModal >= 1) {
			setButtonWork(false);
		} else {
			setButtonWork(true);
		}
		if (topic !== '') {
			setButtonWork(true);
		}
	}, [currentModal, topic]);

	return (
		<div className="dark:bg-[#313339] bg-bgLightMode rounded-lg overflow-hidden text-sm p-4" onClick={()=>console.log()}>
			<div className="flex gap-x-4 mb-4">
				{tabs.map((item, index) => {
					const isCurrent = currentModal === index;
					return (
						<div className="flex-grow text-[10px]" key={index} onClick={() => handleCurrentModal(index)}>
							<div className={`w-full h-[6px] rounded mb-2 ${isCurrent ? 'bg-[#959CF7] ' : 'bg-slate-500'}`}></div>
							<p className={isCurrent ? 'text-[#959CF7]' : 'text-slate-500'}>{item}</p>
						</div>
					);
				})}
			</div>
			<div>
				{currentModal === Tabs_Option.LOCATION && (
					<LocationModal
						option={option}
						voice={voiceChannel}
						voicesChannel={voicesChannel}
						titleEvent={titleEvent}
						handleOption={handleOption}
						handleVoiceChannel={handleVoiceChannel}
						handleTitleEvent={handleTitleEvent}
					/>
				)}
				{currentModal === Tabs_Option.EVENT_INFO && 
					<EventInfoModal 
						option={option} 
						topic={topic} 
						handleTopic={handleTopic} 
						handleTimeStart={handleTimeStart} 
						handleTimeEnd={handleTimeEnd} 
						description={description} 
						handleDescription={handleDescription} 
						logo={logo} 
						setLogo={setLogo} 
						selectedDateStart = {selectedDateStart}
						setSelectedDateStart = {setSelectedDateStart}
						selectedDateEnd = {selectedDateEnd}
						setSelectedDateEnd = {setSelectedDateEnd}
					/>
				}
				{currentModal === Tabs_Option.REVIEW && <ReviewModal option={option} topic={topic} voice={voiceChannel} titleEvent={titleEvent} logo={logo}/>}
			</div>
			<div className="flex justify-between mt-4 w-full">
				<button
					className={`py-2 text-[#84ADFF] font-bold ${currentModal === Tabs_Option.LOCATION && 'hidden'}`}
					onClick={() => handleBack(currentModal)}
				>
					Back
				</button>
				<div className="flex justify-end gap-x-4 w-full">
					<button className="px-4 py-2 rounded bg-slate-500" onClick={onClose}>
						Cancel
					</button>
					<button
						className={`px-4 py-2 rounded bg-primary ${!buttonWork && 'bg-opacity-50'}`}
						onClick={currentModal === Tabs_Option.REVIEW ? () => handleSubmit() : () => handleNext(currentModal)}
					>
						{currentModal === Tabs_Option.REVIEW ? 'Create Event' : 'Next'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ModalCreate;
