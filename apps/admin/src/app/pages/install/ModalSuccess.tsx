import { useAppNavigation } from "@mezon/core";
import { Icons } from '@mezon/ui';
import { useNavigate } from "react-router-dom";
import { TypeSelectClan } from "./ModalAddBot";

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
    }
	return (
		<div className="rounded bg-bgProfileBody max-w-[440px] w-full pt-4 flex flex-col items-center p-6 gap-y-5">
			<Icons.PicSuccessModal />
			<p className="text-base text-colorWhiteSecond">Success!</p>
			<p className="text-sm text-colorWhiteSecond">
				<strong>{name}</strong>
				&nbsp;has been authorised and added 
                {isModalTry ?
				    '.' :
                    <>to&nbsp;<strong>{clan?.clanName}</strong></>
                }
			</p>
			{!isModalTry && (
				<button 
                    className="px-4 py-2 rounded bg-primary w-fit text-sm font-medium" 
                    onClick={handleNavigate}
                >
					Go to <strong>{clan?.clanName}</strong>
				</button>
			)}
			<p className="text-xs text-contentTertiary">You may now close this window or tab.</p>
		</div>
	);
};

export default ModalSuccess;
