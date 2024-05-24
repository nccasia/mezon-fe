import ItemEventManagement from './itemEventManagement';

export type ReviewModalProps = {
	option: string;
	topic: string;
	voice: string | undefined;
	titleEvent: string;
	logo: string;
};

const ReviewModal = (props: ReviewModalProps) => {
	const { topic, voice, titleEvent, option, logo } = props;

	return (
		<div className="dark:text-white text-black">
			<ItemEventManagement topic={topic} voiceChannel={voice || ''} titleEvent={titleEvent} option={option} logo={logo}/>
			<div className="mt-8">
				<h3 className="text-center font-semibold text-xl">Here's a preview of your event.</h3>
				<p className="text-center dark:text-slate-400 text-colorTextLightMode">This event will auto-start when it's time.</p>
			</div>
		</div>
	);
};

export default ReviewModal;
