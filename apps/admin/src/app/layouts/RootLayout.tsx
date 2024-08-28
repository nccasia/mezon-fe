import { selectIsLogin } from '@mezon/store';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLoaderData, useParams } from 'react-router-dom';
import { appDetailTabs } from '../common/constants/appDetailTabs';
import { tabs } from '../common/constants/tabSideBar';
import AppDetailLeftMenu from '../components/AppDetailLeftMenu';
import CollapseSideBar from '../components/CollapseSideBar';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import { useAppearance } from '../context/AppearanceContext';
import { IAuthLoaderData } from '../loader/authLoader';

const RootLayout: React.FC = () => {
	const { isLogin: isLoginLoader, redirect } = useLoaderData() as IAuthLoaderData;
	const isLoginStore = useSelector(selectIsLogin);
	const isLogin = isLoginLoader && isLoginStore;
	const { isDarkMode } = useAppearance();

	const [showCollapseSideBar, setShowCollapseSideBar] = useState(false);
	const toggleCollapseSideBar = () => {
		setShowCollapseSideBar(!showCollapseSideBar);
	};

	const param = useParams();
	const menuItems = useMemo(() => {
		if (param.applicationId) {
			return appDetailTabs;
		}
		return tabs;
	}, [param]);

	if (!isLogin) {
		return <Navigate to={redirect || '/login'} replace />;
	}

	return (
		<div className="dark:bg-bgPrimary bg-bgLightPrimary flex flex-col h-screen dark:text-textDarkTheme text-textLightTheme">
			<Header toggleSideBar={toggleCollapseSideBar} />
			<div className="flex flex-1 overflow-hidden">
				<CollapseSideBar
					currentAppId={param.applicationId}
					tabs={menuItems}
					isShow={showCollapseSideBar}
					toggleSideBar={toggleCollapseSideBar}
				/>
				<div className="min-w-[350px] px-[32px] pt-[16px] pb-[32px] h-full overflow-y-auto max-lg:hidden">
					{param.applicationId ? <AppDetailLeftMenu currentAppId={param.applicationId} tabs={menuItems} /> : <SideBar tabs={menuItems} />}
				</div>
				<div className={`w-full h-full overflow-y-auto overflow-x-hidden px-[32px] py-[16px] ${isDarkMode ? '' : 'customScrollLightMode'}`}>
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default RootLayout;
