import { useAppNavigation } from '@mezon/core';
import { selectTheme } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ThemeApp } from '@mezon/utils';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TypeSelectClan } from './ModalAddBot';

type ModalSuccessProps = {
	name?: string;
	isModalTry?: boolean;
	clan?: TypeSelectClan;
};

const ModalSuccess = (props: ModalSuccessProps) => {
	const { name, isModalTry, clan } = props;
	const { toClanPage } = useAppNavigation();
	const navigate = useNavigate();
	const handleNavigate = () => {
		navigate(toClanPage(clan?.clanId || ''));
	};

	const appearanceTheme = useSelector(selectTheme);

	return (
		<div className="rounded dark:bg-bgProfileBody bg-bgLightMode max-w-[440px] w-full pt-4 flex flex-col items-center p-6 gap-y-5">
			<Icons.PicSuccessModal defaultFill={appearanceTheme === ThemeApp.Light ? '#fff' : '#000'} />
			<p className="text-base dark:text-colorWhiteSecond text-colorTextLightMode">Success!</p>
			<p className="text-sm dark:text-colorWhiteSecond text-colorTextLightMode">
				<strong>{name}</strong>
				&nbsp;has been authorised and added
				{isModalTry ? (
					'.'
				) : (
					<>
						to&nbsp;<strong>{clan?.clanName}</strong>
					</>
				)}
			</p>
			{!isModalTry && (
				<button className="px-4 py-2 rounded bg-primary w-fit text-sm font-medium text-white" onClick={handleNavigate}>
					Go to <strong>{clan?.clanName}</strong>
				</button>
			)}
			<p className="text-xs dark:text-contentTertiary text-black">You may now close this window or tab.</p>
		</div>
	);
};

export default ModalSuccess;
