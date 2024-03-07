import { useClans, useDirect, useSendInviteMessage } from "@mezon/core";
import { selectMembersByChannelId } from "@mezon/store";
import { useMezon } from "@mezon/transport";
import { ChangeEvent, useState } from "react";
import { useSelector } from "react-redux";
export type ModalParam = {
    url:string;
    channelID?: string;
}
const ListMemberInvite = (props:ModalParam) => {
    
    const rawMembers = useSelector(selectMembersByChannelId(props.channelID));
    const memberIds = rawMembers.map(member => member.id);
    console.log("props.channelID: ", rawMembers);
    const [isInviteSent, setIsInviteSent] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { usersClan } = useClans();
    const userIdInClanArray = usersClan.map(user => user.id);
    const { listDM: dmGroupChatList } = useDirect({autoFetch:true});
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	  };
    const filteredListUserClan = dmGroupChatList.filter(item => {
		if ((item.user_id && item.user_id.length > 1) || 
			(item.user_id && item.user_id.length === 1 && !userIdInClanArray.includes(item.user_id[0]))) {
			return true;
		}
		return false;
	});

    const filteredListUserChannel = dmGroupChatList.filter(item => {
		if ((item.user_id && item.user_id.length > 1) || 
			(item.user_id && item.user_id.length === 1 && !memberIds.includes(item.user_id[0]))) {
			return true;
		}
		return false;
	});
    let filteredList: typeof dmGroupChatList;

    if (props.channelID !== undefined) {
        filteredList = filteredListUserChannel;
    } else {
        filteredList = filteredListUserClan;
    }   

    const filteredListBySearch = filteredList.filter(dmGroup => {
		return dmGroup.channel_lable?.toLowerCase().includes(searchTerm.toLowerCase());
	});

    const mezon = useMezon();
    const { sendInviteMessage } = useSendInviteMessage();
    const handleButtonClick = async (directParamId: string, type: number) => {
        setIsInviteSent(true);
		mezon.joinChatDirectMessage(directParamId, "", type);
		sendInviteMessage(props.url, directParamId);
    }
return(
    <>
        <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search..."
            className="w-full h-10 border border-solid border-black bg-black rounded-[5px] px-[10px]"
        />	
        <div className='py-[10px]'>
            {filteredListBySearch.map((dmGroup) => (
                <div key={dmGroup.channel_id} className="flex items-center justify-between py-[5px]">
                    {Array.isArray(dmGroup.channel_avatar) && dmGroup.channel_avatar.length > 1 ? (
                        <img src={`/assets/images/avatar-group.png`} alt="" className="w-[30px] rounded-full" />
                    ) : (
                        <img src={dmGroup.channel_avatar} alt="" className="w-[30px] rounded-full" />
                    )}
                    <p style={{ marginRight: 'auto' }} className='pl-[10px]'>{dmGroup.channel_lable}</p>
                    <button 
                        onClick={() => handleButtonClick(dmGroup.channel_id || '', dmGroup.type || 0)}
                        disabled={isInviteSent}   
                        className={isInviteSent ? "bg-gray-400 text-gray-700 cursor-not-allowed border border-solid border-gray-400 rounded-[5px] py-[5px] px-[10px]" : "bg-green-500 hover:bg-green-600 text-white border border-solid border-green-500 rounded-[5px] py-[5px] px-[10px]"} 
                    >
                        {isInviteSent ? 'Sent' : 'Invite'}
                    </button>
                </div>
            ))}
        </div>
        <hr className='border-solid border-borderDefault rounded-t '/>
    </>
)
}

export default ListMemberInvite