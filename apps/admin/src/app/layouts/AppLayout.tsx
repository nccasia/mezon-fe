import { ToastController } from '@mezon/components';
import { MezonUiProvider } from '@mezon/ui';
import { Outlet } from 'react-router-dom';
import { AppearanceProvider } from '../context/AppearanceContext';
import FlowProvider from '../context/FlowContext';
const AppLayout = () => {
	return (
		<MezonUiProvider>
			<AppearanceProvider>
				<FlowProvider>
					<div id="app-layout">
						<ToastController />
						<Outlet />
					</div>
				</FlowProvider>
			</AppearanceProvider>
		</MezonUiProvider>
	);
};

export default AppLayout;
