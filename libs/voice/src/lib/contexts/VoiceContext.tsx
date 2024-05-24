import { useMezon } from '@mezon/transport';
import options from 'libs/voice/src/lib/voice/options/config';
import React, { useCallback, useEffect } from 'react';

type VoiceContextProviderProps = {
	children: React.ReactNode;
};

export type VoiceContextOption = {
	voiceChannelName: string,
};

export type VoiceContextValue = {
	changeAudioOutput: (selected: any) => void;
	voiceDisconnect: () => void;	
	setVoiceOptions: React.Dispatch<React.SetStateAction<VoiceContextOption | undefined>>;
};

const VoiceContext = React.createContext<VoiceContextValue>({} as VoiceContextValue);

const VoiceContextProvider: React.FC<VoiceContextProviderProps> = ({ children }) => {	
	const [voiceOptions, setVoiceOptions] = React.useState<VoiceContextOption>();	
	const { socketRef } = useMezon();

	const voiceDisconnect = useCallback(() => {
		console.log("voiceDisconnect");
	}, []);

	const changeAudioOutput = useCallback((selected: any) => {
		console.log("changeAudioOutput");
	}, []);

	const value = React.useMemo<VoiceContextValue>(
		() => ({			
			setVoiceOptions,
			voiceDisconnect,
			changeAudioOutput,			
		}),
		[voiceDisconnect, changeAudioOutput],
	);

	return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
};

const VoiceContextConsumer = VoiceContext.Consumer;

export { VoiceContext, VoiceContextConsumer, VoiceContextProvider };
