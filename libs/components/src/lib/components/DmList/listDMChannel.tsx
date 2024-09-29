import { selectStatusStream, selectTheme } from '@mezon/store';
import { IChannel } from '@mezon/utils';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import DMListItem from './DMListItem';

type ListDMChannelProps = {
	listDM: IChannel[];
};

const heightAroundComponent = 230;

const ListDMChannel = (props: ListDMChannelProps) => {
	const { listDM } = props;
	const appearanceTheme = useSelector(selectTheme);
	const streamPlay = useSelector(selectStatusStream);

	const [height, setHeight] = useState(window.innerHeight - heightAroundComponent - (streamPlay ? 56 : 0));

	useEffect(() => {
		const updateHeight = () => setHeight(window.innerHeight - heightAroundComponent - (streamPlay ? 56 : 0));
		updateHeight();
		window.addEventListener('resize', updateHeight);
		return () => window.removeEventListener('resize', updateHeight);
	}, [streamPlay]);

	const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
		return (
			<div style={style} className="pr-2 flex items-center">
				<DMListItem key={index} directMessage={listDM[index]} />
			</div>
		);
	};

	return (
		<List
			height={height}
			itemCount={listDM.length}
			itemSize={56}
			width={'100%'}
			className={`custom-member-list ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
		>
			{Row}
		</List>
	);
};

export default ListDMChannel;
