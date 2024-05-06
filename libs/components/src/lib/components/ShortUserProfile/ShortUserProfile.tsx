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
			<button onClick={handleClickOutside} className="text-white w-full">
				<ModalUserProfile userID={userID} />
			</button>
		</div>
	);
};

export default ShortUserProfile;
