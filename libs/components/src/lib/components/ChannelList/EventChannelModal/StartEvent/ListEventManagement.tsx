import { EventManagementEntity } from '@mezon/store';
import { OptionEvent } from '@mezon/utils';
import ItemEventManagement from '../ModalCreate/itemEventManagement';

type ListEventManagementProps = {
	allEventManagement: EventManagementEntity[];
	checkUserCreate: boolean;
	onOpenDetailItem: (status: boolean) => void;
};

const ListEventManagement = (props: ListEventManagementProps) => {
	const { allEventManagement, checkUserCreate, onOpenDetailItem } = props;

	return allEventManagement.map((event, index) => (
		<div key={index}>
			<ItemEventManagement
				topic={event.title || ''}
				voiceChannel={event.channel_id || ''}
				titleEvent={event.title || ''}
				address={event.address}
				option={event.address ? OptionEvent.OPTION_LOCATION : OptionEvent.OPTION_SPEAKER}
				logoRight={event.logo}
				start={event.start_time || ''}
				end={event.end_time || ''}
				event={event}
				setOpenModalDetail={onOpenDetailItem}
				createTime={event.create_time}
				checkUserCreate={checkUserCreate}
			/>
		</div>
	));
};

export default ListEventManagement;
