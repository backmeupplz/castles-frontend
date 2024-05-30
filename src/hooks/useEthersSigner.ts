import * as React from 'react'
import { BrowserProvider, JsonRpcSigner, Networkish } from 'ethers'
import { UseWalletClientReturnType, useWalletClient } from 'wagmi'

function walletClientToSigner(walletClient: UseWalletClientReturnType) {
  if (!walletClient.data) return null
  const { account, chain, transport } = walletClient.data
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new BrowserProvider(transport, network as Networkish)
  const signer = new JsonRpcSigner(provider, account.address)
  return signer
}

export default function ({ chainId }: { chainId?: number } = {}) {
  const data = useWalletClient({ chainId })
  return React.useMemo(
    () => (data ? walletClientToSigner(data) : undefined),
    [data]
  )
}
