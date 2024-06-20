import { ContenSubmitEventProps } from '@mezon/utils';
import { useMemo } from 'react';
import { handleTimeISO } from '../timeFomatEvent';
import ItemEventManagement from './itemEventManagement';

export type ReviewModalProps = {
	contentSubmit: ContenSubmitEventProps;
	option: string;
};

const ReviewModal = (props: ReviewModalProps) => {
	const { option, contentSubmit } = props;
	const time = useMemo(() => handleTimeISO(contentSubmit.selectedDateStart, contentSubmit.timeStart), []);

	return (
		<div className="dark:text-white text-black">
			<ItemEventManagement
				topic={contentSubmit.topic}
				voiceChannel={contentSubmit.voiceChannel || ''}
				titleEvent={contentSubmit.titleEvent}
				option={option}
				logo={contentSubmit.logo}
				start={time}
			/>
			<div className="mt-8">
				<h3 className="text-center font-semibold text-xl">Here's a preview of your event.</h3>
				<p className="text-center dark:text-slate-400 text-colorTextLightMode">This event will auto-start when it's time.</p>
			</div>
		</div>
	);
};

export default ReviewModal;
