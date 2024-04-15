import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import Store from './app/redux/Store';
import App from './app/App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
