import { selectChannelById, selectChannelFirst } from '@mezon/store';
import * as Icons from '../../../Icons';
import { useSelector } from 'react-redux';

enum OptionEvent {
	OPTION_SPEAKER = 'Speaker',
	OPTION_LOCATION = 'Location',
}

export type ItemEventManagementProps = {
	option: string;
	topic: string;
	voiceChannel: string;
	titleEvent: string;
	address?: string;
	logo?: string;
	logoRight?: string;
};

const ItemEventManagement = (props: ItemEventManagementProps)=>{
    const { topic, voiceChannel, titleEvent, option, address, logo, logoRight } = props;
	const channelFirst = useSelector(selectChannelFirst);
	const channelVoice = useSelector(selectChannelById(voiceChannel));


    return (
        <div className="dark:bg-black bg-bgModifierHoverLight rounded-lg overflow-hidden">
				{logo && <img src={logo} alt='logo' className='w-full max-h-[180px] object-cover'/>}
				<div className="p-4 border-b dark:border-slate-600 border-white">
					<div className="flex items-center gap-x-2 mb-4">
						<Icons.EventIcon />
						<p className="font-semibold dark:text-[#959CF7] text-colorTextLightMode">Event</p>
					</div>
					<div className='flex justify-between'>
						<p className="hover:underline font-bold dark:text-white text-black">{topic}</p>
						{logoRight && <img src={logoRight} alt='logoRight' className='w-[60%] max-h-[100px] object-cover rounded'/>}
					</div>
				</div>
				<div className="p-4 flex items-center gap-x-2">
					{option === OptionEvent.OPTION_SPEAKER && (
						<>
							<Icons.Speaker />
							<p>{channelVoice?.channel_label}</p>
						</>
					)}
					{option === OptionEvent.OPTION_LOCATION  && 
						<>
							<Icons.Location />
							<p>{titleEvent}</p>
						</>
					}
					{option === '' && !address && !channelVoice && (
						<>
							<Icons.Location />
							<p className="hover:underline text-slate-400">{channelFirst.channel_label}</p>
						</>
					)}
				</div>
			</div>
    );
}

export default ItemEventManagement;