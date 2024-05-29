import { cleanEnv, str } from 'envalid'

export default cleanEnv(import.meta.env, {
  VITE_RPC: str(),
  VITE_CONTRACT_ADDRESS: str(),
  VITE_WALLET_CONNECT_PROJECT_ID: str(),
})
