import { useChat } from "@mezon/core";
import { MemberProfile } from "@mezon/components";
import { ChannelMembersEntity } from "@mezon/store";
import { useState } from "react";

export type MemberListProps = {
  className?: string;
  onClick?: (value: string) => void;
};

function MemberList({ onClick }: MemberListProps) {
  const { members } = useChat();
  console.log("member", members);
  const [userId, setUserId] = useState<string>("");
  const getUserId = (userId: string) => {
    console.log("uuserid", userId);

    setUserId(userId);
    if (onClick) {
      onClick(userId);
    }
  };

  return (
    <>
      <div className=" self-stretch h-[268px] flex-col justify-start items-start flex p-[24px] pt-[16px] pr-[24px] pb-[16px] pl-[16px] gap-[24px]">
        {members.map((role: any) => (
          <div key={role.id}>
            {role.title && (
              <p className=" font-['Manrope'] mb-3 text-[#AEAEAE] text-[14px] font-bold flex items-center gap-[4px] font-title text-xs tracking-wide uppercase">
                {role.title}
              </p>
            )}
            {
              <div className="border flex flex-col gap-4 font-['Manrope'] text-[#AEAEAE] cursor-pointer">
                {role?.users.map((user: ChannelMembersEntity) => (
                  <div
                    key={user.id}
                    onClick={() => getUserId(user.id)}
                    className="cursor-pointer"
                  >
                    <MemberProfile
                      avatar={user?.user?.avatar_url ?? ""}
                      name={user?.user?.username ?? ""}
                      status={user.user?.online}
                      isHideStatus={false}
                      key={user.id}
                    />
                  </div>
                ))}
              </div>
            }
          </div>
        ))}
      </div>
    </>
  );
}

export default MemberList;
