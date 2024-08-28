export interface ElectronStoreType {
	credentials: {
		fcm: {
			token: string;
		};
	};
	senderId: string;
	persistentIds: string[];
}
