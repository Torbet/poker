export class Socket {
	private socket: WebSocket;
	private events: Map<string, Function> = new Map();

	constructor(url: string) {
		this.socket = new WebSocket(url);
		this.socket.onmessage = this.onMessage.bind(this);
		this.socket.onopen = this.onOpen.bind(this);
		this.socket.onclose = this.onClose.bind(this);
	}

	on(event: string, callback: Function) {
		this.events.set(event, callback);
	}

	emit(event: string, data?: any) {
		this.socket.send(JSON.stringify({ event, data }));
	}

	onMessage(message: MessageEvent) {
		const { event, data } = JSON.parse(message.data);
		console.log('Received message', event, data);
		const callback = this.events.get(event);
		if (callback) {
			callback(data);
		}
	}

	onOpen() {
		console.log('Connected to server');
	}

	onClose() {
		console.log('Disconnected from server');
	}
}
