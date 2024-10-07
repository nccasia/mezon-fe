import { useAppDispatch } from '@mezon/store';
import { userClanProfileActions } from '@mezon/store-mobile';
import { RefObject, useCallback } from 'react';
import ModalUserProfile from '../ModalUserProfile';

type ModalFooterProfileProps = {
	userId: string;
	avatar?: string;
	name?: string;
	isDM: boolean;
	userStatusProfile: string;
	rootRef?: RefObject<HTMLElement>;
};

const ModalFooterProfile = ({ userId, avatar, name, isDM, userStatusProfile, rootRef }: ModalFooterProfileProps) => {
	const dispatch = useAppDispatch();
	const handleCloseModalFooterProfile = useCallback(() => {
		dispatch(userClanProfileActions.setShowModalFooterProfile(false));
	}, []);

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			className={`outline-none fixed sbm:left-[50px] left-5 bottom-[70px] dark:bg-black bg-gray-200 mt-[10px] w-[340px] max-w-[89vw] rounded-lg flex flex-col z-30 opacity-100 shadow-md shadow-bgTertiary-500/40 origin-bottom animate-scale_up`}
		>
			<ModalUserProfile
				rootRef={rootRef}
				onClose={handleCloseModalFooterProfile}
				userID={userId}
				isFooterProfile
				avatar={avatar}
				name={name}
				isDM={isDM}
				userStatusProfile={userStatusProfile}
			/>
		</div>
	);
};

export default ModalFooterProfile;
