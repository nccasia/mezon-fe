import { selectMemberByUserId } from '@mezon/store';
import { useSelector } from 'react-redux';

type RoleUserProfileProps = {
	userID?: string;
};

const AboutUserProfile = ({ userID }: RoleUserProfileProps) => {
	const userById = useSelector(selectMemberByUserId(userID ?? ''));
	return (
		userById?.user?.about_me &&
			<>
				<div className="w-full border-b-[1px] dark:border-[#40444b] border-gray-200 opacity-70 text-center p-2"></div>
				<div className="flex flex-col">
					<div className="font-bold tracking-wider text-xs pt-2">ABOUT ME</div>
					<div className="font-normal tracking-wider text-xs italic">
						{userById?.user?.about_me}
					</div>
				</div>
			</>
	);
};

export default AboutUserProfile;
