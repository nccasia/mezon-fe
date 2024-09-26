import { IMessageWithUser } from '@mezon/utils';
import { useEffect, useRef, useState } from 'react';
import { Coords } from '../ChannelLink';
import ModalUserProfile from '../ModalUserProfile';
type ShortUserProfilePopup = {
	userID?: string;
	message?: IMessageWithUser;
	mode?: number;
	avatar?: string;
	positionType?: string;
	name?: string;
	coords?: Coords;
	isDM?: boolean;
};

const ShortUserProfile = ({ userID, message, mode, positionType, avatar, name, coords, isDM }: ShortUserProfilePopup) => {
	const [showPopupAddRole, setShowPopupAddRole] = useState(false);
	const profileRef = useRef<HTMLDivElement | null>(null);
	const [positionTop, setPositionTop] = useState<boolean>(false);

	const handleClickOutside = () => {
		if (showPopupAddRole) {
			setShowPopupAddRole(false);
		}
	};

	useEffect(() => {
		const heightPanel = profileRef.current?.clientHeight;
		if (coords && heightPanel && heightPanel > coords.distanceToBottom) {
			setPositionTop(true);
		}
	}, [coords?.distanceToBottom]);

	return (
		<div
			className={`dark:bg-black right-[15] bg-gray-200 mt-[10px] rounded-lg flex flex-col z-10 opacity-100 shortUserProfile fixed  left-5 sbm:left-[185px] md:left-auto w-[300px] max-w-[89vw]`}
			style={{
				top: positionTop ? 'auto' : coords?.mouseY,
				right: Number(coords?.mouseX) + 16,
				bottom: positionTop ? '12px' : 'auto'
			}}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
			ref={profileRef}
		>
			<div className="relative">
				<div onClick={handleClickOutside} className="text-white w-full" role="button">
					<ModalUserProfile
						userID={userID}
						classBanner="rounded-tl-lg rounded-tr-lg h-[105px]"
						message={message}
						mode={mode}
						positionType={positionType}
						avatar={avatar}
						name={name}
						isDM={isDM}
					/>
				</div>
			</div>
		</div>
	);
};

export default ShortUserProfile;
