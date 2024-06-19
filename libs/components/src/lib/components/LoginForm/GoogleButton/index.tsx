import { useAuth } from '@mezon/core';
import { useGoogleLogin } from '@react-oauth/google';
import isElectron from 'is-electron';
import React from 'react';
import { Link } from 'react-router-dom';

const GoogleButtonLogin: React.FC = () => {
	const { loginByGoogle } = useAuth();

	const googleLogin = useGoogleLogin({
		flow: 'auth-code',
		ux_mode: 'popup',
		onSuccess: async ({ code }) => {
			await loginByGoogle(code);
		},
		onError: (errorResponse) => console.log(errorResponse),
	});

	return (
		<div className="w-full lg:px-0">
			{!isElectron() && (
				<button onClick={googleLogin} className="flex justify-center w-full  h-fit p-3 rounded-[4px] bg-[#d1e0ff] relative">
					<div className="flex items-center w-fit h-fit gap-x-1 p-0">
						<img src={'assets/images/google-icon.png'} className="p-0 object-cover" alt="Google Logo" />
						<p className="w-fit h-fit text-base font-medium text-[#155eef] leading-[150%]">Continue with Google</p>
					</div>
				</button>
			)}
			{isElectron() && (
				<Link
					target="_blank"
					to={process.env.NX_CHAT_APP_REDIRECT_URI + '/guess/login-desktop'}
					className="flex justify-center w-full  h-fit p-3 rounded-[4px] bg-[#d1e0ff]"
				>
					<img src={'assets/images/google-icon.png'} className="p-0 object-cover" alt="Google Logo" />
					<p className="w-fit h-fit text-base font-medium text-[#155eef] leading-[150%]">Continue with Google</p>
				</Link>
			)}
		</div>
	);
};

export default GoogleButtonLogin;
