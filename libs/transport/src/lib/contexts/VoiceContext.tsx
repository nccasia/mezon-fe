import React, { useCallback } from "react";
import JitsiConference from "vendors/lib-jitsi-meet/dist/esm/JitsiConference";
import JitsiMeetJS from "vendors/lib-jitsi-meet/dist/esm/JitsiMeetJS";
import JitsiRemoteTrack from "vendors/lib-jitsi-meet/dist/esm/modules/RTC/JitsiRemoteTrack";
import JitsiLocalTrack from "vendors/lib-jitsi-meet/dist/esm/modules/RTC/JitsiLocalTrack";
import { JitsiConferenceErrors } from "vendors/lib-jitsi-meet/dist/esm/JitsiConferenceErrors";
import JitsiConnection from "vendors/lib-jitsi-meet/dist/esm/JitsiConnection";
import options from "libs/transport/src/lib/voice/options/config";
import { useAuth } from "@mezon/core";
import { useMezon } from "@mezon/transport";
import JitsiParticipant from "vendors/lib-jitsi-meet/dist/esm/JitsiParticipant";
import JitsiTrack from "vendors/lib-jitsi-meet/dist/esm/modules/RTC/JitsiTrack";

type VoiceContextProviderProps = {
	children: React.ReactNode;
};

export type VoiceContextValue = {
	voiceConnRef: React.MutableRefObject<JitsiConnection | null>;
	voiceChannelRef: React.MutableRefObject<JitsiConference | null>;
	voiceChannelName: string;
	setTargetTrackNode: React.Dispatch<React.SetStateAction<HTMLMediaElement | undefined>>;
	setVoiceChannelName: React.Dispatch<React.SetStateAction<string>>;
	setUserDisplayName: React.Dispatch<React.SetStateAction<string>>;
	setVoiceChannelId: React.Dispatch<React.SetStateAction<string>>;
	setClanId: React.Dispatch<React.SetStateAction<string>>;
	setClanName: React.Dispatch<React.SetStateAction<string>>;
	changeAudioOutput: (selected: any) => void;
	createLocalTrack: () => void;
	createVoiceConnection: (roomName: string, jwt: string) => Promise<JitsiConnection | null>;
	voiceDisconnect: () => void;
};

const VoiceContext = React.createContext<VoiceContextValue>({} as VoiceContextValue);

const VoiceContextProvider: React.FC<VoiceContextProviderProps> = ({ children }) => {
	const voiceConnRef = React.useRef<JitsiConnection | null>(null);
	const voiceChannelRef = React.useRef<JitsiConference | null>(null);
	const localTracksRef = React.useRef<JitsiLocalTrack[]>([]);
	const remoteTracksRef = React.useRef<Map<string, JitsiRemoteTrack[]>>(new Map());
	const [isJoinedConf, setIsJoinedConf] = React.useState<boolean>(false);	
	const [voiceChannelName, setVoiceChannelName] = React.useState<string>("");
	const [voiceChannelId, setVoiceChannelId] = React.useState<string>("");
	const [userDisplayName, setUserDisplayName] = React.useState<string>("");
	const [clanId, setClanId] = React.useState<string>("");
	const [clanName, setClanName] = React.useState<string>("");
	const [targetTrackNode, setTargetTrackNode] = React.useState<HTMLMediaElement>();

	//const { userProfile } = useAuth();
	const { socketRef } = useMezon();

	const onConnectionFailed = useCallback(() => {
		console.log("onConnectionFailed");
		voiceDisconnect();
	}, []);

	const onDisconnect = useCallback(() => {
		console.log("onDisconnect");
		voiceDisconnect();
	}, []);

	const onLocalTracks = useCallback((tracks: JitsiLocalTrack[] | JitsiConferenceErrors) => {		
		localTracksRef.current = [...(tracks as JitsiLocalTrack[])];

		for (let i = 0; i < localTracksRef.current.length; i++) {
			const localtrack = localTracksRef.current[i] as JitsiLocalTrack
			localtrack.addEventListener(
				JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED, onTrackAudioLevelChanged);
			localtrack.addEventListener(
				JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, onTrackMuteChanged);
			localtrack.addEventListener(
				JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, onLocalTrackStoped);
			localtrack.addEventListener(
				JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, onTrackAudioOuputChanged);
			
			console.log("local track type", localtrack.getType());
			if (localtrack.getType() === 'video') {
				const localVideoElem = document.createElement("video");
				localVideoElem.id = 'localvideo'+i;
				localVideoElem.autoplay = true;
				localtrack.attach(localVideoElem);
				const localTrack = targetTrackNode?.getElementsByClassName("localTrack");
				if (localTrack !== undefined && localTrack?.length > 0) {
					localTrack[0]?.appendChild(localVideoElem);
				}
			} else {
				const localAudioElem = document.createElement("audio");
				localAudioElem.id = 'localaudio'+i;
				localAudioElem.autoplay = true;
				localAudioElem.muted = true;
				localtrack.attach(localAudioElem);
				const localTrack = targetTrackNode?.getElementsByClassName("localTrack");
				if (localTrack !== undefined && localTrack?.length > 0) {
					localTrack[0]?.appendChild(localAudioElem);
				}
			}

			if (isJoinedConf && voiceChannelRef.current) {
				if(voiceChannelRef.current.getLocalAudioTrack() == null || localtrack.getType() === 'video') {
					voiceChannelRef.current.addTrack(localtrack);
				}				
			}
		}
	}, [isJoinedConf, targetTrackNode]);

	const onRemoteTrackRemoved = useCallback((track: JitsiRemoteTrack) => {
		console.log("onRemoteTrackRemoved");
		const participant = track.getParticipantId();
		const index = remoteTracksRef.current.get(participant)?.indexOf(track);
		if (index !== -1 && index !== undefined) {
			remoteTracksRef.current.get(participant)?.splice(index, 1);
		}
	}, []);

	const onRemoteTrackAdded = useCallback((track: JitsiRemoteTrack) => {
		console.log("onRemoteTrackAdded", track);
		if (track.isLocal()) {
			return;
		}

		const participant = track.getParticipantId();
		
		if (remoteTracksRef && remoteTracksRef.current) {
			const remoteTrack = remoteTracksRef.current.get(participant);
			const filter = remoteTrack?.filter(item => item.getId() === track.getId());
			console.log(remoteTrack); // TODO: recheck this
			if ((filter?.length as number) > 0) {
				console.log("already in");
				return; // already added
			}
			remoteTracksRef.current.get(participant)?.push(track);
		}
		
		track.addEventListener(
			JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED, onTrackAudioLevelChanged);
		track.addEventListener(
			JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, onTrackMuteChanged);
		track.addEventListener(
			JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, onLocalTrackStoped);
		track.addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, onTrackAudioOuputChanged);
		
		if (track.getType() === 'video') {
			const remoteVideo = document.createElement("video");
			remoteVideo.autoplay = true;
			remoteVideo.id = 'remotevideo_' + participant;
			track.attach(remoteVideo);

			const remoteTrack = targetTrackNode?.getElementsByClassName("remoteTrack");
			if (remoteTrack !== undefined && remoteTrack?.length > 0) {
				remoteTrack[0]?.appendChild(remoteVideo);
			}
		} else {
			const remoteAudioElem = document.createElement("audio");
			remoteAudioElem.id = 'remoteaudio_'+participant;
			remoteAudioElem.autoplay = true;
			remoteAudioElem.muted = true;
			track.attach(remoteAudioElem);
			const remoteTrack = targetTrackNode?.getElementsByClassName("remoteTrack");
			if (remoteTrack !== undefined && remoteTrack?.length > 0) {
				remoteTrack[0]?.appendChild(remoteAudioElem);
			}
		}
	}, [remoteTracksRef, targetTrackNode]);
	
	const onConferenceJoined = useCallback(() => {
		console.log("onConferenceJoined clan info", clanId, clanName, voiceChannelId, voiceChannelName);
		setIsJoinedConf(true);

		localTracksRef.current.forEach((localTrack) => {
			voiceChannelRef.current?.addTrack(localTrack);
		});

		if (socketRef && socketRef.current) {
			socketRef.current.writeVoiceJoined(
				voiceChannelRef.current?.myUserId() || '',
				clanId,
				clanName,
				voiceChannelId,
				voiceChannelName,
				userDisplayName,
				"",
			)
		}
	}, [clanId, clanName, socketRef, userDisplayName, voiceChannelName]);
	
	const onUserJoined = useCallback((id: string, user: JitsiParticipant) => {
		console.log('user join', id, user);
		remoteTracksRef.current.set(id, []);
		if (socketRef && socketRef.current) {
			socketRef.current.writeVoiceJoined(
				user.getJid(),
				clanId,
				clanName,
				voiceChannelId,				
				voiceChannelName,
				user.getDisplayName(),
				"",
			)
		}	
	}, [clanId, clanName, voiceChannelName, voiceChannelId, socketRef]);

	const onUserLeft = useCallback((id: string, user: JitsiParticipant) => {
		console.log('user left', id);
	}, []);

	const onTrackMuteChanged = useCallback((track: JitsiTrack) => {
		console.log('onTrackMuteChanged');
	}, []);

	const onDisplayNameChanged = useCallback((userID: string, displayName: string) => {
		console.log(`${userID} - ${displayName}`);
	}, []);

	const onAudioLevelChanged = useCallback((userID: string, audioLevel: string) => {
		console.log(`${userID} - ${audioLevel}`);
	}, []);

	const onPhoneNumberChanged = useCallback(() => {
		console.log(`${voiceChannelRef.current?.getPhoneNumber()} - ${voiceChannelRef.current?.getPhonePin()}`);
	}, []);

	const onTrackAudioLevelChanged = useCallback((audioLevel: number) => {
		console.log(`Audio Level: ${audioLevel}`);
		
	}, [])

	const onTrackAudioOuputChanged = useCallback((deviceId: number) => {
		console.log(`track audio output device was changed to ${deviceId}`)		
	}, [])
	

	const onLocalTrackStoped = useCallback((track: JitsiLocalTrack) => {
		console.log('local track stoped')		
	}, [])

	const createLocalTrack = useCallback(() => {				
		JitsiMeetJS.createLocalTracks({ devices: [ 'audio', 'video' ] })
		.then((tracks) => {
			onLocalTracks(tracks);
		}).catch(error => {
			console.log("no local track", error);
		});

		if (JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
			JitsiMeetJS.mediaDevices.enumerateDevices(devices => {
			const audioOutputDevices
				= devices.filter(d => d.kind === 'audiooutput');

			if (audioOutputDevices.length > 1) {
				console.log('#audioOutputSelect');
				console.log('#audioOutputSelectWrapper');
			}
		});
		}
	}, [onLocalTracks]);

	const createVoiceRoom = useCallback(async () => {
		console.log("room name", voiceChannelName);
		if (!voiceConnRef.current) {
			throw new Error('voice connection not init');
		}

		const confOptions = {
			enableLayerSuspension: true,
			p2p: {
				enabled: true
			}
		};

		console.log("room name", voiceChannelName);
		if (voiceChannelRef.current?.getName() === voiceChannelName) {
			console.log("already created");
			return null;
		}
		
		console.log("room name", voiceChannelName);
		voiceChannelRef.current = voiceConnRef.current.initJitsiConference(voiceChannelName, confOptions);	
		voiceChannelRef.current.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrackAdded);
		voiceChannelRef.current.on(JitsiMeetJS.events.conference.TRACK_REMOVED, onRemoteTrackRemoved);
		voiceChannelRef.current.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
		voiceChannelRef.current.on(JitsiMeetJS.events.conference.USER_JOINED, onUserJoined);
		voiceChannelRef.current.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
		voiceChannelRef.current.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, onTrackMuteChanged);
		voiceChannelRef.current.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, onDisplayNameChanged);
		voiceChannelRef.current.on(JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, onAudioLevelChanged);
		voiceChannelRef.current.on(JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED, onPhoneNumberChanged);
		voiceChannelRef.current.join("password");
		voiceChannelRef.current.setReceiverVideoConstraint(720); // max 720

		voiceChannelRef.current.setDisplayName(userDisplayName);

		return voiceChannelRef.current;
	}, [voiceChannelName, onAudioLevelChanged, onConferenceJoined, onDisplayNameChanged, onPhoneNumberChanged, onRemoteTrackAdded, onRemoteTrackRemoved, onTrackMuteChanged, onUserJoined, onUserLeft, userDisplayName])
	
	const onConnectionSuccess = useCallback(() => {
		console.log("onConnectionSuccess");
		createVoiceRoom();
	}, [createVoiceRoom]);

	const createVoiceConnection = useCallback(async (roomName: string, jwt: string) => {
		if (!voiceChannelName) {
			return null; // init when the channel is set
		}

		if (voiceConnRef && voiceConnRef.current) {
			return voiceConnRef.current;
		}

		const optionsWithRoom = { 
			...options,
			serviceUrl: options.serviceUrl + roomName,
		};

		console.log("options", optionsWithRoom);

		JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
		const initOptions = {
			disableAudioLevels: true
		};

		JitsiMeetJS.init(initOptions);

		const connection = new JitsiMeetJS.JitsiConnection("mezon", jwt, optionsWithRoom);

		connection.addEventListener(
			JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
			onConnectionSuccess);
		connection.addEventListener(
			JitsiMeetJS.events.connection.CONNECTION_FAILED,
			onConnectionFailed);
		connection.addEventListener(
			JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
			onDisconnect);	
		
		connection.connect(optionsWithRoom);
		
		voiceConnRef.current = connection;

		if (localTracksRef.current.length === 0) {
			// get local video, audio
			createLocalTrack();
		}

		return connection;
	}, [voiceChannelName, onConnectionSuccess, onConnectionFailed, onDisconnect, createLocalTrack])

	/**
	 * This function is called when we disconnect.
	 */
	const voiceDisconnect = useCallback(async () => {
		console.log('disconnect!');
		if (voiceConnRef && voiceConnRef.current) {
			voiceConnRef.current.removeEventListener(
				JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
				onConnectionSuccess);
			voiceConnRef.current.removeEventListener(
				JitsiMeetJS.events.connection.CONNECTION_FAILED,
				onConnectionFailed);
			voiceConnRef.current.removeEventListener(
				JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
				onDisconnect);
		}
	}, [onConnectionFailed, onConnectionSuccess, onDisconnect]);

	
	/**
	 *
	 * @param selected
	 */
	const changeAudioOutput = useCallback((selected: any) => { // eslint-disable-line no-unused-vars
		JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value);
	}, []);

	const value = React.useMemo<VoiceContextValue>(
		() => ({
			voiceConnRef,
			voiceChannelRef,
			voiceChannelName,
			setTargetTrackNode,
			setVoiceChannelName,
			setVoiceChannelId,
			setUserDisplayName,
			setClanId,
			setClanName,
			createVoiceConnection,
			voiceDisconnect,
			changeAudioOutput,
			createLocalTrack,
		}),
		[voiceChannelName, createVoiceConnection, voiceDisconnect, changeAudioOutput, createLocalTrack],
	);

	return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
};

const VoiceContextConsumer = VoiceContext.Consumer;

export { VoiceContext, VoiceContextConsumer, VoiceContextProvider };

