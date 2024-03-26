import { useAppNavigation, useMemberStatus } from '@mezon/core';
import MemberProfile from '../../MemberProfile';
import { RootState, directActions, useAppDispatch } from '@mezon/store';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
export type DirectMessProp = {
    directMessage: any;
};

function DMListItem({ directMessage }: DirectMessProp) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const currentDmGroupId = useSelector((state: RootState) => state.direct.currentDirectMessageId);
    const pathname = useLocation().pathname;

    const { toDmGroupPage } = useAppNavigation();
    const joinToChatAndNavigate = async (DMid: string, type: number) => {
        const result = await dispatch(
            directActions.joinDirectMessage({
                directMessageId: DMid,
                channelName: '',
                type: type,
            }),
        );
        await dispatch(directActions.selectDmGroupCurrentId(DMid));
        if (result) {
            navigate(toDmGroupPage(DMid, type));
        }
    };

    const userStatus = useMemberStatus(directMessage?.user_id?.length === 1 ? directMessage?.user_id[0] : '')
    
    return (
        <button
            key={directMessage.channel_id}
            className={`group text-[#AEAEAE] hover:text-white h-fit pl-2 rounded-[6px] hover:bg-bgSecondary py-2 w-full focus:bg-bgTertiary ${directMessage.channel_id === currentDmGroupId && !pathname.includes('friends') ? 'bg-[#1E1E1E] text-white' : ''}`}
            onClick={() => joinToChatAndNavigate(directMessage.channel_id, directMessage.type)}
        >
            <MemberProfile
                numberCharacterCollapse={22}
                avatar={Array.isArray(directMessage?.channel_avatar) && directMessage?.channel_avatar?.length !== 1 ? '/assets/images/avatar-group.png' : (directMessage?.channel_avatar ?? '')}
                name={directMessage?.channel_label ?? ''}
                status={userStatus}
                isHideStatus={true}
                isHideIconStatus={false}
                key={directMessage.channel_id}
            />
        </button>
    );
}

export default DMListItem;
