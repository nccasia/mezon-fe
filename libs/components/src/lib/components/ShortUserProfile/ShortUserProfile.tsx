import { useState } from 'react';
import ModalUserProfile from '../ModalUserProfile';
type ShortUserProfilePopup = {
	userID?: string;
};

const ShortUserProfile = ({ userID }: ShortUserProfilePopup) => {
	const [showPopupAddRole, setShowPopupAddRole] = useState(false);
	const handleClickOutside = () => {
		if (showPopupAddRole) {
			setShowPopupAddRole(false);
		}
	};
	return (
		<div className="relative">
			<div onClick={handleClickOutside} className="text-white w-full" role='button'>
				<ModalUserProfile userID={userID} />
			</div>
		</div>
	);
};

export default ShortUserProfile;
