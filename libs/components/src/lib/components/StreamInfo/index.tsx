import { useAuth } from '@mezon/core';
import { selectCurrentStreamInfo, selectTheme, useAppDispatch, usersStreamActions, videoStreamActions } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const StreamInfo = () => {
    const { userProfile } = useAuth();
    const dispatch = useAppDispatch();
    const currentStreamInfo = useSelector(selectCurrentStreamInfo);
    const channelPath = `/chat/clans/${currentStreamInfo?.clanId}/channels/${currentStreamInfo?.streamId}`;
    const appearanceTheme = useSelector(selectTheme);

    const handleLeaveChannel = async () => {
        if (currentStreamInfo) {
            dispatch(videoStreamActions.stopStream());
        }
        dispatch(usersStreamActions.remove(userProfile?.user?.id || ''));
    };

    const streamAddress = `${currentStreamInfo?.streamName + ' / ' + currentStreamInfo?.clanName}`;

    return (
        <div
            className={` border-b
			 dark:border-borderDefault border-gray-300 px-4 py-2 hover:bg-gray-550/[0.16]
			 shadow-sm transition dark:bg-bgSecondary600 bg-channelTextareaLight
			 w-full group focus-visible:outline-none footer-profile ${appearanceTheme === 'light' && 'lightMode'}`}
        >
            <div className="flex justify-between items-center">
                <div className="flex flex-col max-w-[200px]">
                    <div className="flex items-center gap-1">
                        <Icons.NetworkStatus defaultSize="w-4 h-4 dark:text-channelTextLabel" />
                        <div className="text-green-700 font-bold text-base">Stream Connected</div>
                    </div>
                    <Link to={channelPath}>
                        <div className="hover:underline font-medium dark:text-channelTextLabel text-colorTextLightMode text-xs dark:text-contentSecondary">
                            {streamAddress && streamAddress.length > 30 ? `${streamAddress.substring(0, 30)}...` : streamAddress}
                        </div>
                    </Link>
                </div>
                <button
                    className="opacity-80 dark:text-[#AEAEAE] text-black dark:hover:bg-[#5e5e5e] hover:bg-bgLightModeButton hover:rounded-md p-1"
                    onClick={handleLeaveChannel}
                >
                    <Icons.EndCall className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default StreamInfo;
