import { WebSocketProvider } from 'ethers'
import env from 'helpers/env'

export default new WebSocketProvider(env.VITE_RPC)
