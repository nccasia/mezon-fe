import { ChannelList, ChannelTopbar, FooterProfile, MemberList, ServerHeader } from "@mezon/components";
import { useAppNavigation, useAppParams } from "@mezon/core";
import { selectDefaultChannelIdByClanId } from "@mezon/store";
import { useSelector } from "react-redux";
import ChannelMessages from "./ChanneMessages";
import { ChannelMessageBox } from "./ChannelMessageBox";
import { useEffect } from "react";

export function ChannelIndex() {
    const { serverId } = useAppParams();
    const defaultChannelId = useSelector(selectDefaultChannelIdByClanId(serverId || ''))
    const { navigate } = useAppNavigation();

    useEffect(() => {
        if (defaultChannelId) {
            navigate(`./${defaultChannelId}`)
        }
    }, [defaultChannelId, navigate])

    return (
        <>
            <div className="hidden flex-col w-[272px] bg-bgSurface md:flex">
                <ServerHeader
                    name={''}
                    type="channel"
                    bannerImage={''} />
                <ChannelList />
                <FooterProfile
                    name={''}
                    status={true}
                    avatar={''}
                    openSetting={() => { }} />
            </div>
            <div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%]">
                <ChannelTopbar channel={null} />
                <div className="flex h-screen">
                    <div className="flex flex-col flex-1">
                        <div className="overflow-y-auto bg-[#1E1E1E] h-[751px]">
                            <ChannelMessages.Skeleton />
                        </div>
                        <div className="flex-shrink-0 bg-bgSecondary">
                            <ChannelMessageBox.Skeleton />
                        </div>
                    </div>
                    <div className="w-[268px] bg-bgSurface md:flex">
                        <MemberList />
                    </div>
                </div>
            </div>
        </>
    )

}