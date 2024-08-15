import { selectIsLogin } from '@mezon/store';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLoaderData } from 'react-router-dom';
import { tabs } from '../common/constants/tabSideBar';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import { useAppearance } from '../context/AppearanceContext';
import { IAuthLoaderData } from '../loader/authLoader';

const RootLayout: React.FC = () => {
	const { isLogin: isLoginLoader, redirect } = useLoaderData() as IAuthLoaderData;
	const isLoginStore = useSelector(selectIsLogin);
	const isLogin = isLoginLoader && isLoginStore;
	const {isDarkMode} = useAppearance();
	if (!isLogin) {
		return <Navigate to={redirect || '/login'} replace />;
	}

	return (
		<div className="dark:bg-bgPrimary bg-bgLightPrimary flex flex-col h-screen dark:text-textDarkTheme text-textLightTheme">
			<Header />
			<div className="flex flex-1 overflow-hidden pt-[66px]">
				<div className="min-w-[350px] px-[32px] pt-[16px] pb-[32px] h-full overflow-y-auto">
					<SideBar tabs={tabs} />
				</div>
				<div className={`w-full h-full overflow-y-auto overflow-x-hidden px-[64px] py-[16px] ${isDarkMode ? '' : 'customScrollLightMode'}`}>
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default RootLayout;
