import { useChat } from '@mezon/core';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Modal } from 'flowbite-react';
import { useEffect, useState } from 'react';

export default function InvitePage() {
  const [openModal, setOpenModal] = useState(false);
  const [clanName, setClanName] = useState('Mezon');
  const [channelName, setChannelName] = useState('general');

  const { inviteId: inviteIdParam } = useParams();
  const navigate = useNavigate();
  const { inviteUser, getLinkInvite } = useChat();

  const joinChannel = async () => {
    if (inviteIdParam) {
      inviteUser(inviteIdParam).then((res) => {
        if (res.channel_id && res.clan_id) {
          console.log(
            'LInk : ',
            `/chat/servers/${res.clan_id}/channels/${res.channel_id}`,
          );
          navigate(`/chat/servers/${res.clan_id}/channels/${res.channel_id}`);
        }
      });
    }
  };

  const handleJoinChannel = () => {
    console.log('Join Channel');
    joinChannel();
    setOpenModal(false);
  };

  const handleCancelJoin = () => {
    navigate(`/chat/direct`);
    setOpenModal(false);
  };

  useEffect(() => {
    if (inviteIdParam) {
      getLinkInvite(inviteIdParam).then((res) => {
        console.log('res: ', res);
        // if (res.channel_id && res.clan_id) {
        // }
        // navigate(`/chat/servers/${res.clan_id}/channels/${res.channel_id}`);
        setClanName(res.clan_name ?? 'Mezon');
        setChannelName(res.channel_name ?? 'general');
        setOpenModal(true);
      });
    }
  }, []);

  console.log('clanName: ', clanName, 'channelName: ', clanName);
  return (
    <>
      <div></div>
      <Modal show={openModal} onClose={() => setOpenModal(false)} size={'md'}>
        {/* <Modal.Header></Modal.Header> */}
        <Modal.Body className="bg-bgDisable rounded-tl-[5px] rounded-tr-[5px]">
          <div className="flex flex-col justify-center items-center pb-24">
            <div className="w-[70px] h-[70px] bg-bgDisable rounded-lg flex justify-center items-center text-contentSecondary text-[25px] bg-zinc-900 ">
              {clanName.charAt(0).toUpperCase()}
            </div>
            <p className="text-base text-gray-400 dark:text-gray-400 text-[18px] mt-3 ">
              You've been invite to join
            </p>
            <p className="text-4xl text-white font-semibold mt-4">{clanName}</p>
            <p className="text-4xl text-white text-[18px]">#{channelName}</p>
          </div>
        </Modal.Body>
        {/* <Modal.Footer> */}
        <div className="flex justify-center flex-row items-center gap-4 pb-8 bg-bgDisable rounded-bl-[5px] rounded-br-[5px]">
          <Button color="gray" onClick={handleCancelJoin}>
            No, Thanks
          </Button>
          <Button color="blue" onClick={handleJoinChannel}>
            Join Mezon
          </Button>
        </div>
        {/* </Modal.Footer> */}
      </Modal>
    </>
  );
}
