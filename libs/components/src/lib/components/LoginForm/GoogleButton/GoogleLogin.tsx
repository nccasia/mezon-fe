import React from 'react';
import { Link } from 'react-router-dom';

const GoogleLogin: React.FC = () => {
	// useEffect(() => {
	// 	const windowGlobal = (typeof window !== 'undefined' && window) as any;

	// 	if (!windowGlobal.google) {
	// 		console.error('Google API is not loaded.');
	// 		return;
	// 	}

	// 	try {
	// 		windowGlobal.google.accounts.id.initialize({
	// 			client_id: '352171078728-ppke8p0ds1692s6bl6h72ngmh5kcjeu9.apps.googleusercontent.com',
	// 			ux_mode: 'redirect', // Set ux_mode to 'redirect' to get authorization code
	// 			// login_uri: 'https://accounts.google.com/o/oauth2/v2/auth', // Ensure this is the correct redirect URI
	// 			response_type: 'code' // Request authorization code
	// 		});

	// 		windowGlobal.google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
	// 			type: 'standard',
	// 			shape: 'rectangular',
	// 			size: 'large',
	// 			logo_alignment: 'left',
	// 			width: 'full'
	// 		});
	// 	} catch (err) {
	// 		console.error('Error during Google login initialization:', err);
	// 	}
	// }, []);

	const getOauthGoogleUrl = () => {
		const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
		const options = {
			redirect_uri: 'http://localhost:4200',
			client_id: '285548761692-l9bdt00br2jg1fgh4c23dlb9rvkvqqs0.apps.googleusercontent.com',
			access_type: 'offline',
			response_type: 'code',
			prompt: 'consent',
			scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(' ')
		};
		const qs = new URLSearchParams(options);
		return `${rootUrl}?${qs.toString()}`;
	};
	const oauthURL = getOauthGoogleUrl();
	console.log(oauthURL);
	return (
		<>
			{' '}
			<div>
				{' '}
				<Link className="bg-white" to={oauthURL}>
					Login with Google
				</Link>
			</div>
			{/* <div className="o-loginSocials_google">
				<div id="google-signin-button"></div>
			</div> */}
		</>
	);
};

export default GoogleLogin;
