/*
 *
 *  Created: 2024-01-10
 *  Author: Sebastian Grignoli  <grignoli@gmail.com>
 *
 */

class WebSocketManager {
    constructor(server) {
        this.server = server;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.reconnectAttempts = 0;
        this.ws = null;
        this.channels = {};
        this.keepAliveInterval = null;
        this.eventListeners = {
            open: [],
            close: [],
            error: [],
            message: []
        };

        this.initWebSocket();
    }

    initWebSocket() {
        this.ws = new WebSocket(`ws://${this.server}/channel/websocket`);

        this.ws.onopen = (event) => {
            this.reconnectAttempts = 0;
            Object.values(this.channels).forEach(channel => channel._join());
            this._emit('open', event);
        };

        this.ws.onclose = (event) => {
            this._emit('close', event);
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => this.initWebSocket(), this.reconnectInterval);
                this.reconnectAttempts++;
            }
        };

        this.ws.onerror = (error) => {
            this._emit('error', error);
            this.ws.close();
        };

        this.ws.onmessage = (event) => {
            this._emit('message', event);
            const response = JSON.parse(event.data);
            const channel = this.channels[response.topic];
            if (channel) {
                channel._handleMessage(response);
            }
        };
    }

    on(event, listener) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(listener);
        }
    }

    _emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(listener => listener(data));
        }
    }

    configureReconnection(maxAttempts, interval) {
        this.maxReconnectAttempts = maxAttempts;
        this.reconnectInterval = interval;
    }

    joinChannel(topic) {
        const channel = new Channel(this.ws, `room:${topic}`);
        this.channels[`room:${topic}`] = channel;
        return channel;
    }

    setKeepAliveInterval(interval) {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
        }

        if (interval > 0) {
            this.keepAliveInterval = setInterval(() => {
                this.ws.send(JSON.stringify({
                    topic: "keepalive",
                    event: "ping",
                    payload: {},
                    ref: 0
                }));
            }, interval);
        }
    }
}

class Channel {
    constructor(ws, topic) {
        this.ws = ws;
        this.topic = topic;
        this.eventListeners = {
            message: []
        };
        this._join();
    }

    _join() {
        const joinPayload = {
            topic: this.topic,
            event: "phx_join",
            payload: {},
            ref: 1
        };
        this.ws.send(JSON.stringify(joinPayload));
    }

    send(message) {
        const messagePayload = {
            topic: this.topic,
            event: "shout",
            payload: { message: message },
            ref: 2
        };
        this.ws.send(JSON.stringify(messagePayload));
    }

    on(event, listener) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(listener);
        }
    }

    _handleMessage(response) {
        if (response.topic === this.topic) {
            this._emit('message', response.payload.message);
        }
    }

    _emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(listener => listener(data));
        }
    }
}

// Usage
const wsManager = new WebSocketManager("publish.ip1.cc:4000");
wsManager.on('open', () => console.log('WebSocket opened'));
wsManager.on('close', () => console.log('WebSocket closed'));
wsManager.on('error', error => console.log('WebSocket error:', error));
wsManager.on('message', event => console.log('WebSocket message:', event));

const channel = wsManager.joinChannel('someTopic');
channel.on('message', message => console.log('Received on someTopic:', message));
