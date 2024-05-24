import { useAppNavigation, useAppParams } from '@mezon/core';
import { selectChannelById } from '@mezon/store';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

type ChannelHashtagProps = {
	tagName: string;
};

const ChannelHashtag = ({ tagName }: ChannelHashtagProps) => {
	const { clanId } = useAppParams();
	const { toChannelPage } = useAppNavigation();

	const getChannelPath = (tagName: string, clanId: string): string | undefined => {
		if (tagName.startsWith('#')) {
			return toChannelPage(tagName.slice(1), clanId || '');
		}
		return undefined;
	};
	const channelPath = getChannelPath(tagName, clanId ?? '');

	const getChannelById = (channelId: string) => {
		const channel = useSelector(selectChannelById(channelId));
		return channel;
	};
	return (
		channelPath && (
			<Link
				style={{ textDecoration: 'none' }}
				to={channelPath}
				className="font-medium cursor-pointer whitespace-nowrap !text-[#3297ff] hover:!text-white dark:bg-[#3C4270] bg-[#D1E0FF] hover:bg-[#5865F2]"
			>
				{tagName.startsWith('#') && getChannelById(tagName.slice(1)) && `#${getChannelById(tagName.slice(1)).channel_label}`}
			</Link>
		)
	);
};

export default ChannelHashtag;
