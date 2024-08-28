import { fetchApplications, selectAppById, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { memo, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLoaderData, useParams } from 'react-router-dom';
import { useAppearance } from '../../context/AppearanceContext';
import { IAuthLoaderData } from '../../loader/authLoader';
import ModalAddBot from './ModalAddBot';
import ModalTry from './ModalTry';

const Install: React.FC = () => {
	const dispatch = useAppDispatch();
	const { isLogin, redirect } = useLoaderData() as IAuthLoaderData;
	const { applicationId } = useParams();
	const appSelect = useSelector(selectAppById(applicationId || ''));

	const [openModalAdd, setOpenModalAdd] = useState(false);
	const handleOpenModalAdd = useCallback(() => {
		setOpenModalAdd(!openModalAdd);
	}, [openModalAdd]);

	const [openModalTry, setOpenModalTry] = useState(false);
	const handleOpenModalTry = useCallback(() => {
		setOpenModalTry(!openModalTry);
	}, [openModalTry]);

	useEffect(() => {
		dispatch(fetchApplications({}));
	}, [dispatch]);

	if (!isLogin) {
		return <Navigate to={redirect || '/login'} replace />;
	}

	return (
		<div className="dark:bg-bgPrimary bg-bgLightPrimary flex flex-col h-screen dark:text-textDarkTheme text-textLightTheme relative justify-center items-center">
			<HeaderInstall />
			{!openModalAdd && !openModalTry ? (
				<div className="rounded bg-bgProfileBody max-w-[440px] w-full px-4 py-8 flex flex-col items-center">
					<div className="rounded-full dark:text-bgAvatarLight text-bgAvatarDark dark:bg-bgAvatarDark bg-bgAvatarLight text-2xl font-bold size-[80px] min-w-[80px] uppercase flex justify-center items-center">
						{appSelect?.appname?.at(0)}
					</div>
					<p className="text-2xl font-semibold mt-2">{appSelect?.appname}</p>
					<ContentInstall handleOpenModalAdd={handleOpenModalAdd} handleOpenModalTry={handleOpenModalTry} />
				</div>
			) : (
				<>
					{openModalAdd && (
						<ModalAddBot nameApp={appSelect?.appname} handleOpenModal={handleOpenModalAdd} applicationId={applicationId || ''} />
					)}
					{openModalTry && <ModalTry nameApp={appSelect?.appname} handleOpenModal={handleOpenModalTry} />}
				</>
			)}
		</div>
	);
};

export default Install;

const HeaderInstall = memo(() => {
	const { isDarkMode } = useAppearance();

	return (
		<div className="flex flex-row items-center justify-center gap-[4px] absolute top-5 left-5">
			<img
				src={isDarkMode ? 'assets/images/mezon-logo-black.svg' : 'assets/images/mezon-logo-white.svg'}
				alt="LogoMezon"
				width={36}
				height={36}
			/>
			<span className="text-2xl font-bold">MEZON</span>
		</div>
	);
});

type ContentInstallProps = {
	handleOpenModalAdd: () => void;
	handleOpenModalTry: () => void;
};

const ContentInstall = memo((props: ContentInstallProps) => {
	const { handleOpenModalAdd, handleOpenModalTry } = props;
	return (
		<div className="bg-bgTertiary rounded w-full cursor-pointer">
			<div className="flex items-center gap-x-3 pt-2" onClick={handleOpenModalTry}>
				<Icons.AddPerson className="text-contentTertiary ml-4" />
				<div className="flex justify-between items-center pb-2 flex-1 border-b border-solid border-gray-700">
					<div>
						<h4 className="text-base font-medium">Try It Now</h4>
						<p className="text-contentTertiary text-xs">Use this app everywhere!</p>
					</div>
					<Icons.ArrowRight defaultSize="size-6 mr-2" />
				</div>
			</div>
			<div className="flex items-center gap-x-3 py-2" onClick={handleOpenModalAdd}>
				<Icons.AddServe className="text-contentTertiary ml-4" />
				<div className="flex justify-between items-center flex-1">
					<div>
						<h4 className="text-base font-medium">Add to Server</h4>
						<p className="text-contentTertiary text-xs">Customise your server by adding this app</p>
					</div>
					<Icons.ArrowRight defaultSize="size-6 mr-2" />
				</div>
			</div>
		</div>
	);
});
