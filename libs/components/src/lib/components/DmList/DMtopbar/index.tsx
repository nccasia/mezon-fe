import { selectDmGroupCurrent } from '@mezon/store';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { SearchMessage } from '../../ChannelTopbar/TopBarComponents';
import * as Icons from '../../Icons/index';
import MemberProfile from '../../MemberProfile';

export type ChannelTopbarProps = {
	dmGroupId?: string;
};

function DmTopbar({ dmGroupId }: ChannelTopbarProps) {
	const currentDmGroup = useSelector(selectDmGroupCurrent(dmGroupId ?? ''));

	return (
		<div className="flex  h-heightTopBar min-w-0 items-center bg-bgSecondary border-b border-black px-3 flex-shrink">
			<div className="justify-start items-center gap-1 flex w-full">
				<div className="flex flex-row gap-1 items-center">
					<MemberProfile
						numberCharacterCollapse={22}
						avatar={Array.isArray(currentDmGroup?.channel_avatar) && currentDmGroup?.channel_avatar?.length !== 1 ? '' : (currentDmGroup?.channel_avatar ?? '')}
						name={''}
						status={false}
						isHideStatus={true}
						isHideIconStatus={false}
						key={currentDmGroup.channel_id}
					/>
					<h2 className="font-[Manrope] shrink-1 text-white text-ellipsis">{currentDmGroup.channel_lable}</h2>
				</div>

				<div className=" items-center h-full ml-auto flex flex-1 justify-end">
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
						<div className="justify-start items-start gap-4 flex">
							<button>
								<Icons.Inbox />
							</button>
							<button>
								<Icons.Help />
							</button>
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
