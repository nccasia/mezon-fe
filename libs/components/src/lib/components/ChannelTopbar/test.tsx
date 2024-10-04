import { render, screen } from '@testing-library/react';

import ChannelTopbar from '.';

describe('<ChannelTopbar />', () => {
	it('should render correctly', () => {
		const channel = {
			label: 'welcome',
			description: 'Introduction to the Tailwind CSS framework and community.'
		};
		render(<ChannelTopbar channel={channel} />);

		expect(screen.getByText(channel.label)).toBeInTheDocument();
		expect(screen.getByText(channel.description)).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
	});
});
