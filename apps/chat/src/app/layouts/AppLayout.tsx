import { Outlet } from 'react-router-dom';
import { MezonUiProvider } from '@mezon/ui';

const theme = 'dark';

const AppLayout = () => {
	return (
		<MezonUiProvider themeName={theme}>
			<div id="app-layout">
				<Outlet />
			</div>
		</MezonUiProvider>

	);
};

export default AppLayout;
