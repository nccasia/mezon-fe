import { selectTheme } from '@mezon/store';
import { Tooltip } from 'flowbite-react';
import { useSelector } from 'react-redux';

export type SidebarTooltipProps = {
	titleTooltip?: string;
	readonly children?: React.ReactElement | string;
};

const SidebarTooltip = ({ titleTooltip, children }: SidebarTooltipProps) => {
	const appearanceTheme = useSelector(selectTheme);

	return (
		<Tooltip
			content={
				<p style={{ whiteSpace: 'nowrap' }} className="max-w-60 truncate">
					{titleTooltip}
				</p>
			}
			trigger="hover"
			animation="duration-500"
			style={appearanceTheme === 'light' ? 'light' : 'dark'}
			placement="right"
		>
			{children}
		</Tooltip>
	);
};
export default SidebarTooltip;
