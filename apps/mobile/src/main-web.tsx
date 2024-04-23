import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import Navigation from './app/navigation';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<StrictMode>
		<Navigation />
	</StrictMode>,
);
