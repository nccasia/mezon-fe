import { render, screen } from '@testing-library/react';

import NavLink from '.';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useRouter = jest.spyOn(require('next/router'), 'useRouter');

let asPath = '';
useRouter.mockImplementation(() => ({
	asPath
}));

describe('<NavLink />', () => {
	it('should render correctly with children and link', () => {
		render(<NavLink href="/some-link">Discord</NavLink>);

		expect(screen.getByText(/discord/i)).toBeInTheDocument();
		expect(screen.getByRole('link')).toHaveAttribute('href', '/some-link');
	});

	it('should render with active styles if the prop is passed', () => {
		render(
			<NavLink href="/some-link" active>
				Discord
			</NavLink>
		);

		expect(screen.getByText(/discord/i)).toHaveClass('rounded-2xl bg-brand text-white');
	});

	it('should render with active styles if the route is active', () => {
		asPath = '/some-link';
		render(<NavLink href="/some-link">Discord</NavLink>);

		expect(screen.getByText(/discord/i)).toHaveClass('rounded-2xl bg-brand text-white');
	});
});
