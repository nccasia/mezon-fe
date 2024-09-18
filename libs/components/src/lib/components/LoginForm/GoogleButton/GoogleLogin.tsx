import React, { useEffect } from 'react';

const GoogleLogin: React.FC = () => {
	useEffect(() => {
		const windowGlobal = (typeof window !== 'undefined' && window) as any;

		if (!windowGlobal.google) {
			console.error('Google API is not loaded.');
			return;
		}

		try {
			windowGlobal.google.accounts.id.initialize({
				client_id: '285548761692-l9bdt00br2jg1fgh4c23dlb9rvkvqqs0.apps.googleusercontent.com',
				ux_mode: 'redirect',
				login_uri: 'http://localhost:4200/v2/account/authenticate/google' // Ensure this matches your redirect URI in Google Cloud console
			});

			windowGlobal.google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
				type: 'standard',
				shape: 'rectangular',
				size: 'large',
				logo_alignment: 'left',
				width: 'full'
			});
		} catch (err) {
			console.error('Error during Google login initialization:', err);
		}
	}, []);

	return (
		<div className="o-loginSocials_google">
			<div id="google-signin-button"></div>
		</div>
	);
};

export default GoogleLogin;
