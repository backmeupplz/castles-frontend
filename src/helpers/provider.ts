import { JsonRpcProvider } from 'ethers'
import env from 'helpers/env'

export default new JsonRpcProvider(env.VITE_RPC)
