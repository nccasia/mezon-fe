import { useMemberStatus, useMenu } from '@mezon/core';
import { selectDmGroupCurrent } from '@mezon/store';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { HelpButton, InboxButton } from '../../ChannelTopbar';
import { SearchMessage } from '../../ChannelTopbar/TopBarComponents';
import * as Icons from '../../Icons/index';
import MemberProfile from '../../MemberProfile';

export type ChannelTopbarProps = {
	dmGroupId?: string;
};

function DmTopbar({ dmGroupId }: ChannelTopbarProps) {
	const currentDmGroup = useSelector(selectDmGroupCurrent(dmGroupId ?? ''));
	const userStatus = useMemberStatus(currentDmGroup?.user_id?.length === 1 ? currentDmGroup?.user_id[0] : '');
	const { closeMenu, statusMenu, setStatusMenu } = useMenu();

	return (
		<div
			className={`flex h-heightHeader min-w-0 items-center bg-bgSecondary border-b border-black flex-shrink  fixed z-[1] w-full sbm:w-widthHeader top-0 right-0 ${closeMenu && !statusMenu ? '' : 'left-[344px] right-auto'}`}
		>
			<div className="justify-start items-center gap-1 flex w-full">
				<div className="flex flex-row gap-1 items-center">
					<div onClick={() => setStatusMenu(true)} className="mx-6">
						<Icons.OpenMenu defaultSize={`w-5 h-5 ${closeMenu && !statusMenu ? '' : 'hidden'}`} />
					</div>
					<MemberProfile
						numberCharacterCollapse={22}
						avatar={
							Array.isArray(currentDmGroup?.channel_avatar) && currentDmGroup?.channel_avatar?.length !== 1
								? '/assets/images/avatar-group.png'
								: currentDmGroup?.channel_avatar?.at(0) ?? ''
						}
						name={''}
						status={userStatus}
						isHideStatus={true}
						isHideIconStatus={false}
						key={currentDmGroup?.channel_id}
					/>
					<h2 className="shrink-1 text-white text-ellipsis">{currentDmGroup?.channel_label}</h2>
				</div>

				<div className=" items-center h-full ml-auto hidden flex-1 justify-end ssm:flex">
					<div className=" items-center gap-2 flex">
						<div className="justify-start items-center gap-[15px] flex">
							<button>
								<Icons.ThreadIcon />
							</button>
							<button>
								<Icons.MuteBell />
							</button>
							<button>
								<Icons.PinRight />
							</button>
							<button>
								<Icons.MemberList />
							</button>
							<button>
								<Icons.ThreeDot />
							</button>
						</div>
						<SearchMessage />
						<div
							className={`gap-4 iconHover relative flex  w-[82px] h-8 justify-center items-center left-[345px] ssm:left-auto ssm:right-0`}
							id="inBox"
						>
							<InboxButton />
							<HelpButton />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

DmTopbar.Skeleton = () => {
	return (
		<div className="flex  h-heightTopBar min-w-0 items-center bg-bgSecondary border-b border-black px-3 pt-4 pb-6 flex-shrink">
			<Skeleton width={38} height={38} />
		</div>
	);
};

export default DmTopbar;
