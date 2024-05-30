import { useEffect, useState } from 'preact/compat'

const cache = new Map<
  string,
  {
    username?: string
    ens?: string
    address: string
  }
>()

async function fetchUserData(address: string): Promise<{
  username?: string
  ens?: string
  address: string
}> {
  if (cache.has(address)) {
    const cachedValue = cache.get(address)
    if (cachedValue) {
      return cachedValue
    }
  }
  try {
    const response = await fetch(
      `https://farcaster-data.vercel.app/api/wallet-info?address=${address}`
    )
    const data = await response.json()
    cache.set(address, {
      username: data.farcaster?.usernames?.[0],
      ens: data.primaryEns,
      address,
    })
    return {
      username: data.farcaster?.usernames?.[0],
      ens: data.primaryEns,
      address,
    }
  } catch (error) {
    console.error(
      `Failed to fetch user data for ${address}:`,
      error instanceof Error ? error.message : error
    )
    cache.set(address, { address })
    return { address }
  }
}

export default function AddressDisplay({ address }: { address: string }) {
  const [display, setDisplay] = useState<string>(address)

  useEffect(() => {
    const tempAddress = address
    fetchUserData(address).then((data) => {
      if (tempAddress !== address) return
      if (data.username) {
        setDisplay(data.username)
      } else if (data.ens) {
        setDisplay(data.ens)
      } else {
        setDisplay(data.address)
      }
    })
  }, [address])

  return <div>{display}</div>
}
