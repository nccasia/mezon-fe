import { GoogleButtonLogin, LoginForm, QRSection, TitleSection } from '@mezon/components';
import { useAppNavigation } from '@mezon/core';
import { authActions, selectIsLogin, useAppDispatch } from '@mezon/store';
import isElectron from 'is-electron';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLoaderData } from 'react-router-dom';
import { ILoginLoaderData } from '../../loaders/loginLoader';

function Login() {
	const { navigate } = useAppNavigation();
	const dispatch = useAppDispatch();
	const isLogin = useSelector(selectIsLogin);
	const { redirectTo } = useLoaderData() as ILoginLoaderData;
	const deepLinkUrl = JSON.parse(localStorage.getItem('deepLinkUrl') as string);

	useEffect(() => {
		if (deepLinkUrl && isElectron()) {
			const data = JSON.parse(decodeURIComponent(deepLinkUrl));
			dispatch(authActions.setSession(data));
			localStorage.removeItem('deepLinkUrl');
		}
	}, [deepLinkUrl, dispatch]);

	useEffect(() => {
		if (isLogin) {
			navigate(redirectTo || '/chat/direct/friends');
		}
	}, [redirectTo, isLogin, navigate]);

	return (
		<div
			className=" w-screen h-screen  overflow-x-hidden overflow-y-scroll  scrollbar-hide flex items-center"
			style={{
				background: 'linear-gradient(219.23deg, #2970FF 1.49%, #8E84FF 43.14%, #E0D1FF 94.04%)',
			}}
		>
			<div className=" justify-center items-center flex w-full h-full sm:max-h-[580px] sm:h-9/10 sm:max-w-[450px] lg:min-w-[850px] lg:max-h-[620px]  rounded-none sm:rounded-2xl lg:p-12 px-0 dark:bg-[#0b0b0b] bg-[#F0F0F0] flex-col mx-auto">
				<div className="relative top-0 flex-col pb-0 lg:top-0 lg:pb-0 flex lg:flex-row lg:gap-x-12 items-center w-full overflow-y-auto hide-scrollbar lg:overflow-y-visible">
					<div className="flex-col justify-start items-center flex h-fit p-0 gap-2 pb-2 lg:pb-0 md:gap-4 w-9/10">
						<TitleSection />
						<GoogleButtonLogin />
						<LoginForm />
					</div>
					<QRSection />
				</div>
			</div>
		</div>
	);
}

export default Login;
