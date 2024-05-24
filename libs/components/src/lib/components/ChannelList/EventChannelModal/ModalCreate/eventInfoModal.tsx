import { TextArea } from '@mezon/ui';
import { useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { handleUploadFile, useMezon } from '@mezon/transport';

enum OptionEvent {
	OPTION_SPEAKER = 'Speaker',
	OPTION_LOCATION = 'Location',
}

export type EventInfoModalProps = {
	topic: string;
	description: string;
	option: string;
	logo: string;
	selectedDateStart: Date;
	selectedDateEnd: Date;
	setSelectedDateStart: (value: Date) => void;
	setSelectedDateEnd: (value: Date) => void;
	setLogo: (value: string) => void;
	handleTopic: (content: string) => void;
	handleTimeStart: (time: string) => void;
	handleTimeEnd: (time: string) => void;
	handleDescription: (content: string) => void;
};

const EventInfoModal = (props: EventInfoModalProps) => {
	const { topic, description, option, logo, selectedDateStart, selectedDateEnd, setSelectedDateStart, setSelectedDateEnd, setLogo, handleTopic, handleTimeStart, handleTimeEnd, handleDescription } = props;
	const [countCharacterDescription, setCountCharacterDescription] = useState(1024);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	const frequencies = [
		'Does not repeat',
		'Weekly on Friday',
		'Every other Friday',
		'Monthly on the first Friday',
		'Annually on 03 May',
		'Every weekday (Monday to Friday)',
	];

	const handleDateChangeStart = (date: Date) => {
		setSelectedDateStart(date);
	};

	const handleDateChangeEnd = (date: Date) => {
		setSelectedDateEnd(date);
	};

	const renderOptions = () => {
		const options = [];
		for (let hour = 0; hour < 24; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
				options.push(
					<option key={timeString} value={timeString}>
						{timeString}
					</option>,
				);
			}
		}
		return options;
	};

	const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		handleDescription(e.target.value);
		setCountCharacterDescription(1024 - e.target.value.length);
	};

	const handleChangeTimeStart = (e:any)=>{
		handleTimeStart(e.target.value);
	}

	const handleChangeTimeEnd = (e:any)=>{
		handleTimeEnd(e.target.value);
	}

	const { sessionRef, clientRef } = useMezon();
	const handleFile = (e: any) => {
		const file = e?.target?.files[0];
		const fullfilename = file?.name;
		const session = sessionRef.current;
		const client = clientRef.current;
		if (!file) return;
		if (!client || !session) {
			throw new Error('Client or file is not initialized');
		}
		handleUploadFile(client, session, fullfilename, file).then((attachment: any) => {
			setLogo(attachment.url ?? '');
		});
	};

	return (
		<div className='max-h-[500px] overflow-y-auto hide-scrollbar'>
			<div className="mb-4">
				<h3 className="uppercase text-[11px] font-semibold">Event Topic</h3>
				<input
					type="text"
					name="location"
					placeholder="What's your event?"
					onChange={(e) => handleTopic(e.target.value)}
					value={topic}
					className="font-[400] rounded w-full dark:text-white text-black outline-none text-[15px]border dark:border-black p-2 focus:outline-none focus:border-white-500 dark:bg-black bg-bgModifierHoverLight"
				/>
			</div>
			<div className="mb-4 flex gap-x-4">
				<div className="w-1/2">
					<h3 className="uppercase text-[11px] font-semibold ">Start Date</h3>
					<DatePicker
						className="dark:bg-black bg-bgModifierHoverLight dark:text-white text-black p-2 rounded outline-none w-full"
						wrapperClassName="w-full"
						selected={selectedDateStart}
						onChange={handleDateChangeStart}
						dateFormat="dd/MM/yyyy"
						minDate={new Date()}
					/>
				</div>
				<div className="w-1/2">
					<h3 className="uppercase text-[11px] font-semibold ">Start Time</h3>
					<select
						name="timeStart"
						onChange={handleChangeTimeStart}
						className="block w-full dark:bg-black bg-bgModifierHoverLight dark:text-white text-black border dark:border-black rounded p-2 font-normal text-sm tracking-wide outline-none border-none"
					>
						{renderOptions()}
					</select>
				</div>
			</div>
			{option === OptionEvent.OPTION_LOCATION && 
				<div className="mb-4 flex gap-x-4">
					<div className="w-1/2">
						<h3 className="uppercase text-[11px] font-semibold ">End Date</h3>
						<DatePicker
							className="dark:bg-black bg-bgModifierHoverLight dark:text-white text-black p-2 rounded outline-none w-full"
							wrapperClassName="w-full"
							selected={selectedDateEnd}
							onChange={handleDateChangeEnd}
							dateFormat="dd/MM/yyyy"
							minDate={new Date()}
						/>
					</div>
					<div className="w-1/2">
						<h3 className="uppercase text-[11px] font-semibold ">End Time</h3>
						<select
							name="timeEnd"
							onChange={handleChangeTimeEnd}
							className="block w-full dark:bg-black bg-bgModifierHoverLight dark:text-white text-black border dark:border-black rounded p-2 font-normal text-sm tracking-wide outline-none border-none"
						>
							{renderOptions()}
						</select>
					</div>
				</div>
			}
			<div className="mb-4">
				<h3 className="uppercase text-[11px] font-semibold">Event Frequency</h3>
				<select
					name="frequency"
					className="block w-full dark:bg-black bg-bgModifierHoverLight dark:text-white text-black border dark:border-black rounded p-2 font-normal text-sm tracking-wide outline-none border-none"
				>
					{frequencies.map((frequency) => (
						<option key={frequency} value={frequency}>
							{frequency}
						</option>
					))}
				</select>
			</div>
			<div className="mb-4">
				<h3 className="uppercase text-[11px] font-semibold">Description</h3>
				<div className="relative">
					<TextArea
						placeholder="Let everyone know how to use this channel!"
						className="resize-none h-auto min-h-[87px] w-full dark:bg-black bg-bgModifierHoverLight dark:text-white text-black overflow-y-hidden outline-none py-2 pl-3 pr-5"
						value={description}
						onChange={handleChangeTextArea}
						rows={1}
						refTextArea={textAreaRef}
					></TextArea>
					<p className="absolute bottom-2 right-2 text-[#AEAEAE]">{countCharacterDescription}</p>
				</div>
			</div>
			<div className="mb-4">
				<h3 className="uppercase text-[11px] font-semibold">Cover Image</h3>
				<label>
					<div
						className="text-white font-medium bg-bgSelectItem hover:bg-bgSelectItemHover rounded px-4 py-2 my-2 w-fit"
						onChange={(e) => handleFile(e)}
					>
						Upload Image
					</div>
					<input type="file" onChange={(e) => handleFile(e)} className="w-full text-sm text-slate-500 hidden" />
				</label>
				{logo && <img src={logo} alt="logo" className='max-h-[180px] rounded w-full object-cover'/> }
			</div>
		</div>
	);
};

export default EventInfoModal;
