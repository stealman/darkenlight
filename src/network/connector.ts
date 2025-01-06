import { LoginMsg } from '@/network/messages'
import { ResponseProcessor } from '@/network/responseProcessor'

export const Connector = {
    socket: null as WebSocket,

    initialize() {
        this.socket = new WebSocket('ws://localhost:3000')

        this.socket.onopen = () => {
            console.log('WS connection estabilished')
            this.sendLoginRequest('test', 'test')
        }

        this.socket.onmessage = (event) => {
           ResponseProcessor.processResponse(JSON.parse(event.data))
        }

        this.socket.onerror = (error) => {
            console.error('Chyba spojení:', error)
        }

        this.socket.onclose = () => {
            console.log('Spojení uzavřeno')
        }
    },

    sendLoginRequest(username: string, password: string) {
        const loginMsg = new LoginMsg(username, password)
        this.socket.send(JSON.stringify(loginMsg))
    }
}

