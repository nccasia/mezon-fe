import { useAuth } from '@mezon/core';
import { selectIsLogin, selectSession, selectTheme } from '@mezon/store';
import { useGoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const LoginDesktop = () => {
	const { loginByGoogle } = useAuth();
	const appearanceTheme = useSelector(selectTheme);

	const isLogin = useSelector(selectIsLogin);
	const session = useSelector(selectSession);

	const googleLogin = useGoogleLogin({
		flow: 'auth-code',
		ux_mode: 'popup',
		onSuccess: async ({ code }) => {
			const session = await loginByGoogle(code);
			const jsonString = encodeURIComponent(JSON.stringify(session));
			window.location.href = `mezonapp://accounts?data=${jsonString}`;
		},
		onError: (errorResponse) => console.log(errorResponse),
	});

	useEffect(() => {
		if (session) {
			const jsonString = encodeURIComponent(JSON.stringify(session));
			window.location.href = `mezonapp://accounts?data=${jsonString}`;
		}
	}, [session]);

	return (
		<div
			className="w-screen h-screen overflow-x-hidden overflow-y-scroll scrollbar-hide flex items-center"
			style={{
				background: 'linear-gradient(219.23deg, #2970FF 1.49%, #8E84FF 43.14%, #E0D1FF 94.04%)',
			}}
		>
			{isLogin ? (
				<div className=" justify-center items-center flex w-full h-full lg:max-w-[360px] lg:max-h-[370px] rounded-none sm:rounded-2xl lg:p-12 px-0 dark:bg-[#F9F9F9] bg-[#F0F0F0] flex-col mx-auto">
					<div className="text-textLightTheme">
						<img
							src={`/assets/images/${appearanceTheme === 'dark' ? 'mezon-logo-black.svg' : 'mezon-logo-white.svg'}`}
							alt=""
							className="h-[120px] mb-8 clan w-full aspect-square"
						/>
						<h3 className="text-xl font-bold text-center">{`It’s great to have you aboard, ${session?.username}`}</h3>
						<p className="text-sm font-medium text-center mt-4">Redirecting you to the Desktop App</p>
					</div>
				</div>
			) : (
				<div className=" justify-center items-center flex w-full h-full lg:max-w-[850px] lg:max-h-[620px] rounded-none sm:rounded-2xl lg:p-12 px-0 dark:bg-transparent bg-transparent flex-col mx-auto">
					<div className="relative top-0 flex-col pb-0 lg:top-0 lg:pb-0 flex lg:flex-row lg:gap-x-12 items-center w-full overflow-y-auto hide-scrollbar lg:overflow-y-visible">
						<div className="flex-col justify-start items-center flex h-fit p-0 gap-2 pb-2 lg:pb-0 md:gap-4 w-9/10">
							<div className="w-full lg:px-0">
								<button onClick={googleLogin} className="flex justify-center w-full  h-fit p-3 rounded-[4px] bg-[#d1e0ff] relative">
									<div className="flex items-center w-fit h-fit gap-x-1 p-0">
										<img src={'assets/images/google-icon.png'} className="p-0 object-cover" alt="Google Logo" />
										<p className="w-fit h-fit text-base font-medium text-[#155eef] leading-[150%]">Continue with Google</p>
									</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default LoginDesktop;
