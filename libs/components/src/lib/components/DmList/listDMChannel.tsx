import { IChannel } from '@mezon/utils';
import { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import DMListItem from './DMListItem';

type ListDMChannelProps = {
	listDM: IChannel[];
};

const heightAroundComponent = 230;

const ListDMChannel = (props: ListDMChannelProps) => {
	const { listDM } = props;

	const [height, setHeight] = useState(window.innerHeight - heightAroundComponent);

	useEffect(() => {
		const handleResize = () => setHeight(window.innerHeight - heightAroundComponent);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
		return (
			<div style={style} className="pr-2 flex items-center">
				<DMListItem key={index} directMessage={listDM[index]} />
			</div>
		);
	};

	return (
		<List height={height} itemCount={listDM.length} itemSize={56} width={'100%'} className="thread-scroll">
			{Row}
		</List>
	);
};

export default ListDMChannel;
