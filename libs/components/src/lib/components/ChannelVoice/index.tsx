import { useMezonVoice } from "@mezon/transport";
import { useCallback, useEffect } from "react";

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
        const targetNode = document.getElementById("meet");
        voice.setTargetTrackNode(targetNode as HTMLElement);

        const canvasTrack = document.getElementById("canvas");		
		if (canvasTrack !== undefined) {
			voice.setScreenCanvasElement(canvasTrack as HTMLCanvasElement);
            voice.setScreenCanvasCtx((canvasTrack as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D);
		}
		
        const videoShareElem = document.getElementById("screenvideo");
        videoShareElem!.style.display = "none";
        voice.setScreenVideoElement(videoShareElem as HTMLVideoElement);
        voice.createVoiceConnection(voiceChannelName.toLowerCase(), jwt);
    }, [voice]);

    const startScreenShare = useCallback(() => {
        voice.createScreenShare();
    }, [voice]);

    const stopScreenShare = useCallback(() => {
        voice.stopScreenShare();
    }, [voice]);

    const leaveVoiceChannel = useCallback(() => {
        voice.voiceDisconnect();
    }, [voice]);
    
    return (
        <div className="space-y-2 px-4 mb-4 mt-[250px]" >
            <div><button  type="button" onClick={startScreenShare}>SCREEN SHARE</button></div>
            <div><button  type="button" onClick={stopScreenShare}>STOP SHARE</button></div>
            <div><button  type="button" onClick={leaveVoiceChannel}>LEAVE VOICE CHANNEL</button></div>
            <div id="meet">
                <canvas id="canvas"></canvas>
                <div className="localTrack"></div>
                <div className="remoteTrack"></div> 
                <video id="screenvideo" autoPlay width={460} height={640}/>
            </div>            
        </div>
    ); 
}

export default ChannelVoice;
