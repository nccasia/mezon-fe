import { selectChannelById, selectMemberByDisplayName, selectMembersByChannelId } from '@mezon/store';
import { AvatarComponent, NameComponent } from '@mezon/ui';
import { IChannelMember } from '@mezon/utils';
import { useSelector } from 'react-redux';
import { Icons } from '../../components';

function UserListItem({user, channelID}: {user: IChannelMember, channelID: string}){
    const member = useSelector(selectMemberByDisplayName(user.participant ||''));

    return(
        <div className="dark:hover:bg-[#36373D] hover:bg-bgLightModeButton w-[90%] flex p-1 ml-5 items-center gap-3 cursor-pointer rounded-sm">
            <div className="w-5 h-5 rounded-full scale-75">
                <div className="w-8 h-8 mt-[-0.3rem]">
                    {member ? <AvatarComponent id='' url={member?.user?.avatar_url || ''}/> : <Icons.AvatarUser /> }
                </div>
            </div>
            <div>
                {member ? <NameComponent id='' name={member?.user?.username|| ''}/> : <p className='text-sm font-medium dark:text-[#AEAEAE] text-colorTextLightMode'>{user.participant} (guest)</p> }
            </div>
        </div>
    )
}

export default UserListItem;