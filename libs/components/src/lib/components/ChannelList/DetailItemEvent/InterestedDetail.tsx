import { selectMemberClanByUserId } from '@mezon/store';
import { useSelector } from 'react-redux';

type InterestedDetailProps = {
	userID: string | undefined;
};

const InterestedDetail = (props: InterestedDetailProps) => {
	const { userID } = props;
	const userCreate = useSelector(selectMemberClanByUserId(userID || ''));

	return (
		<div className="p-4 space-y-1 dark:text-zinc-300 text-colorTextLightMode text-base font-semibold max-h-[250px] h-[250px] hide-scrollbar overflow-auto">
			<div className="flex items-center gap-x-3 rounded dark:hover:bg-slate-600 hover:bg-bgLightModeButton p-2">
				<img src={userCreate?.user?.avatar_url} alt={userCreate?.user?.avatar_url} className="size-7 rounded-full" />
				<p>{userCreate?.user?.username}</p>
			</div>
		</div>
	);
};

export default InterestedDetail;
