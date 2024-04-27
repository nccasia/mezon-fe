import { selectMemberByUserId } from '@mezon/store';
import { useSelector } from 'react-redux';

type RoleUserProfileProps = {
	userID?: string;
};

const AboutUserProfile = ({ userID }: RoleUserProfileProps) => {
	const userById = useSelector(selectMemberByUserId(userID || ''));
	return (
		<div className="flex flex-col">
			<div className="font-bold tracking-wider text-xs ">ABOUT ME</div>
			<div className="font-normal tracking-wider text-xs italic">

				{userById?.user?.about_me}
			</div>
			
		</div>
	);
};

export default AboutUserProfile;
