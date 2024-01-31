import {
  ChannelTopbar,
  DirectMessageList,
  FooterProfile,
  ServerHeader,
} from "@mezon/components";
import ChannelMessages from "../channel/ChanneMessages";
import { ChannelMessageBox } from "../channel/ChannelMessageBox";
import { useAppNavigation, useChat } from "@mezon/core";
import { useEffect, useState } from "react";
import Setting from "../setting";
import { MemberList } from "@mezon/components";
import { ChannelTypeEnum, DmCategoryExam } from "@mezon/utils";
import { ApiCreateChannelDescRequest } from "vendors/mezon-js/packages/mezon-js/dist/api.gen";
import { channelsActions, useAppDispatch } from "@mezon/store";
import { useNavigate } from "react-router-dom";
import { userInfo } from "os";

export default function Direct() {
  const { userProfile } = useChat();
  const [openSetting, setOpenSetting] = useState(false);
  const currentDirectMess = true; //get form store
  const handleOpenCreate = () => {
    setOpenSetting(true);
  };
  const dispatch = useAppDispatch();
  const [userIdArr, setUserId] = useState<string[]>([]);

  // const handleClicked2 = (param: string) => {
  //   console.log("p", param);
  // };
  const navigate = useNavigate();
  const { toChannelPage } = useAppNavigation();
  const handleClickProfile = async () => {
    // userIdArr.push(paramUserId);
    console.log("started");
    const bodyCreateDm: ApiCreateChannelDescRequest = {
      clan_id: DmCategoryExam.CLAN_DM,
      type: ChannelTypeEnum.CHANNEL_TEXT,
      channel_lable: DmCategoryExam.CATEGORY_DM,
      channel_private: 1,
      category_id: DmCategoryExam.CATEGORY_DM,
      user_ids: [DmCategoryExam.USER_ID2],
    };

    const response = await dispatch(
      channelsActions.createNewChannel(bodyCreateDm),
    );
    const resPayload = response.payload as ApiCreateChannelDescRequest;
    const channelName = resPayload.channel_lable;
    const channelId = resPayload.channel_id;
    console.log("channelName", channelName);
    console.log("channelId", channelId);
    const joined = await dispatch(
      channelsActions.joinChanelDM(channelId as string),
    );
    console.log("joined", joined);

    // if (joined) {
    //   const channelPath = toChannelPage(
    //     channelId ?? "",
    //     bodyCreateDm.clan_id ?? "",
    //   );
    //   navigate(channelPath);
    //   console.log("CPATH", channelPath);
    // }
  };

  return (
    <>
      <div className="hidden flex-col w-60 bg-bgSurface md:flex">
        <ServerHeader type={"direct"} />

        <DirectMessageList />
        <button className="border" onClick={handleClickProfile}>
          Chat with user 11
        </button>

        {/* <MemberList onClick={handleClickProfile} /> */}
        <FooterProfile
          name={userProfile?.user?.username || ""}
          status={userProfile?.user?.online}
          avatar={userProfile?.user?.avatar_url || ""}
          openSetting={handleOpenCreate}
        />
      </div>
      <div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary">
        <ChannelTopbar channel={undefined} />
        {currentDirectMess ? (
          <>
            <div className="overflow-y-scroll flex-1">
              <ChannelMessages.Skeleton />
            </div>
            <div className="flex-shrink-0 bg-bgSecondary">
              <ChannelMessageBox typeChatDirectMessage={true} />
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
      <Setting
        open={openSetting}
        onClose={() => {
          setOpenSetting(false);
        }}
      />
    </>
  );
}
