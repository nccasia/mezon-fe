type SocketStatus = 'connected' | 'disconnected' | 'connecting';

let _socketStatus: SocketStatus = 'disconnected';
const statusListeners = new Set<(status: SocketStatus) => void>();

export const socketState = {
	get status(): SocketStatus {
		return _socketStatus;
	},
	set status(value: SocketStatus) {
		if (_socketStatus === value) {
			return;
		}
		_socketStatus = value;
		statusListeners.forEach((listener) => listener(value));
	},
	get isConnected(): boolean {
		return _socketStatus === 'connected';
	},
	subscribe(listener: (status: SocketStatus) => void): () => void {
		statusListeners.add(listener);
		return () => {
			statusListeners.delete(listener);
		};
	}
};
