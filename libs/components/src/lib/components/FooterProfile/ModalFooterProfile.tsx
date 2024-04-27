import ModalUserProfile from '../ModalUserProfile';

type ModalFooterProfileProps = {
	userId: string;
};

const ModalFooterProfile = ({ userId }: ModalFooterProfileProps) => {
	return (
		<div
			onClick={(e) => e.stopPropagation()}
			className={`fixed left-[50px] bottom-[70px] bg-[#151515] mt-[10px] w-[340px] rounded-lg flex flex-col z-10 opacity-100`}
		>
			<ModalUserProfile userID={userId} isFooterProfile />
		</div>
	);
};

export default ModalFooterProfile;
