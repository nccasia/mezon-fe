import ModalUserProfile from '../ModalUserProfile';

type ModalFooterProfileProps = {
	userId: string;
	avatar?: string;
	name?: string;
	isDM: boolean;
	userStatusProfile: string;
};

const ModalFooterProfile = ({ userId, avatar, name, isDM, userStatusProfile }: ModalFooterProfileProps) => {
	return (
		<div
			onClick={(e) => e.stopPropagation()}
			className={`fixed sbm:left-[50px] left-5 bottom-[70px] dark:bg-black bg-gray-200 mt-[10px] w-[340px] max-w-[89vw] rounded-lg flex flex-col z-20 opacity-100 shadow-md shadow-bgTertiary-500/40`}
		>
			<ModalUserProfile userID={userId} isFooterProfile avatar={avatar} name={name} isDM={isDM} userStatusProfile={userStatusProfile} />
		</div>
	);
};

export default ModalFooterProfile;
