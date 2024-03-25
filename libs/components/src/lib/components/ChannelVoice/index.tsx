import { useMezonVoice } from "@mezon/transport";
import { useEffect } from "react";

export type ChannelVoiceProps = {
    clanId: string;
    clanName: string;
    channelId: string;
    channelLabel: string;
    userName: string;
    jwt: string;
};

function ChannelVoice({ clanId, clanName, channelId, channelLabel, userName, jwt }: ChannelVoiceProps) {
    const voice = useMezonVoice();

    const voiceChannelName = clanName?.replace(" ", "-")+"-"+channelLabel.replace(" ", "-")

    useEffect(()=> {
        voice.setVoiceChannelName(voiceChannelName.toLowerCase());
        voice.setVoiceChannelId(channelId);
        voice.setUserDisplayName(userName);
        voice.setClanId(clanId);
        voice.setClanName(clanName);
        const targetNode = document.querySelector("#meet");
        voice.setTargetTrackNode(targetNode as HTMLMediaElement);
        voice.createVoiceConnection(voiceChannelName.toLowerCase(), jwt);
    }, [voice]);
    
    return (
        <div className="space-y-2 px-4 mb-4 mt-[250px]" >
            <div id="meet">
                <div className="localTrack"></div>
                <div className="remoteTrack"></div>
            </div>            
        </div>
    ); 
}

export default ChannelVoice;
