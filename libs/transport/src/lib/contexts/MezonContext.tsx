import React, { useCallback } from 'react';
import { CreateNakamaClientOptions, createClient as createNakamaClient } from '../nakama';
import { Client, Session } from '@heroiclabs/nakama-js';
import { DeviceUUID } from "device-uuid";

type MezonContextProviderProps = {
    children: React.ReactNode
    nakama: CreateNakamaClientOptions
    connect?: boolean
}

export type MezonContextValue = {
    clientRef: React.MutableRefObject<Client | null> 
    sessionRef: React.MutableRefObject<Session | null> 
    createClient: () => Promise<Client>
    authenticateEmail: (email: string, password: string) => Promise<Session>
    authenticateDevice: (username: string) => Promise<Session>
    authenticateGoogle: (token: string) => Promise<Session>
}

const MezonContext = React.createContext<MezonContextValue>({} as MezonContextValue);

const MezonContextProvider: React.FC<MezonContextProviderProps> = ({ children, nakama, connect }) => {

    const clientRef = React.useRef<Client | null>(null);
    const sessionRef = React.useRef<Session | null>(null);

    const createClient = useCallback(async () => {
        const client = await createNakamaClient(nakama);
        clientRef.current = client;
        return client;
    }, [nakama]);

    const authenticateEmail = useCallback(async (email: string, password: string) => {
        if (!clientRef.current) {
            throw new Error('Nakama client not initialized');
        }
        const session = await clientRef.current.authenticateEmail(email, password);
        sessionRef.current = session;
        return session;
    }, [clientRef]);

    const authenticateGoogle = useCallback(async (token: string) => {
        if (!clientRef.current) {
            throw new Error('Nakama client not initialized');
        }
        const session = await clientRef.current.authenticateGoogle(token);
        sessionRef.current = session;
        return session;
    }, [clientRef]);

    const authenticateDevice = useCallback(async (username: string) => {

        if (!clientRef.current) {
            throw new Error('Nakama client not initialized');
        }

        const deviceId = new DeviceUUID().get();

        const session = await clientRef.current
            .authenticateDevice(deviceId, true, username)
        sessionRef.current = session;
        return session;
    }, [clientRef]);

    const value = React.useMemo<MezonContextValue>(() => ({
        clientRef,
        sessionRef,
        createClient,
        authenticateDevice,
        authenticateEmail,
        authenticateGoogle
    }), [
        clientRef,
        sessionRef,
        createClient,
        authenticateDevice,
        authenticateEmail,
        authenticateGoogle
    ]);

    React.useEffect(() => {
        if (connect) {
            createClient();
        }
    }, [connect, createClient]);

    return (
        <MezonContext.Provider value={value}>
            {children}
        </MezonContext.Provider>
    );
}

const MezonContextConsumer = MezonContext.Consumer;

export { MezonContext, MezonContextProvider, MezonContextConsumer };