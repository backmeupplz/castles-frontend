import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ContractTransactionReceipt, ethers, formatEther } from 'ethers'
import castlesContract from 'helpers/castlesContract'
import useEthersSigner from 'hooks/useEthersSigner'
import CastleType from 'models/CastleType'
import { useEffect, useState } from 'preact/hooks'
import { useAccount, useBalance } from 'wagmi'
import TxLink from 'components/TxLink'
import { useAtomValue } from 'jotai'
import { balancesAtom, feeAtom } from 'atoms/contract'
import SuspenseWithError from 'components/SuspenseWithError'
import { referralAtom } from 'atoms/referral'
import Link from 'components/Link'

function ErrorAlert({ error }: { error: Error | null }) {
  return (
    error && (
      <div role="alert" class="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error defending! {error.message}</span>
      </div>
    )
  )
}

function SuccessTxAlert({
  tx,
  castle,
}: {
  tx: ContractTransactionReceipt | null
  castle: CastleType
}) {
  const { address } = useAccount()
  return (
    tx && (
      <div role="alert" class="alert alert-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          Successfully defended the {castle} castle! See the{' '}
          <TxLink hash={tx.hash}>
            <span className="text-primary-content no-underline hover:underline">
              transaction
            </span>
          </TxLink>
          .
          {!!address && (
            <span>
              {' '}
              <Link
                url={`https://warpcast.com/~/compose?text=I%20defended%20the%20${castle}%20castle!%20Come%20fight%20me%20at%20castles.lol%20⚔️&embeds[]=https://castles.lol?r=${address}`}
              >
                <span className="text-primary-content no-underline hover:underline">
                  Share to Farcaster
                </span>
              </Link>
            </span>
          )}
        </span>
      </div>
    )
  )
}

function EnoughEthLabel({ value }: { value: string }) {
  const { address } = useAccount()
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address,
  })
  if (isLoadingBalance || !balanceData) return null
  return (parseFloat(value) || 0) > +ethers.formatEther(balanceData.value) ? (
    <span class="label-text-alt">Make sure you have enough ETH to defend!</span>
  ) : null
}

function calculateNetValueInEth(value: string, fee: bigint) {
  return (ethers.parseEther(value) * (100n - fee)) / 100n
}

function ProfitLabel({ value, castle }: { value: string; castle: CastleType }) {
  const { address } = useAccount()
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address,
  })
  if (!balanceData || isLoadingBalance) return null
  const fee = useAtomValue(feeAtom)
  const [netValueInEth, setNetValueInEth] = useState(
    calculateNetValueInEth(value, fee)
  )
  const [profit, setProfit] = useState(0n)
  const [northBalance, southBalance] = useAtomValue(balancesAtom)

  useEffect(() => {
    let ownCastleBalance =
      castle === CastleType.north ? northBalance : southBalance
    const opposingCastleBalance =
      castle === CastleType.north ? southBalance : northBalance

    const netValueInEth =
      (ethers.parseEther(value.toString()) * (100n - fee)) / 100n
    setNetValueInEth(netValueInEth)

    if (ownCastleBalance + netValueInEth < opposingCastleBalance) {
      ownCastleBalance = opposingCastleBalance + 1n
    } else {
      ownCastleBalance += netValueInEth
    }
    if (netValueInEth <= 0n) {
      setProfit(0n)
      return
    }
    const proportion = BigInt(
      Math.round((1 / Number(ownCastleBalance / netValueInEth)) * 10000)
    )
    setProfit((proportion * opposingCastleBalance) / 10000n)
  }, [northBalance, southBalance, value, castle])

  useEffect(() => {
    setNetValueInEth(calculateNetValueInEth(value, fee))
  }, [value])

  return (parseFloat(value) || 0) <= +ethers.formatEther(balanceData.value) &&
    ethers.parseEther(value) > 0n &&
    ethers.parseEther(value) < profit + netValueInEth ? (
    <span class="label-text-alt">
      If your castle wins, you can potentially get{' '}
      {ethers.formatEther(profit + netValueInEth)} ETHs back!
    </span>
  ) : null
}

function Defend({ castle }: { castle: CastleType }) {
  const { address } = useAccount()
  const { data, isLoading: isLoadingBalance } = useBalance({
    address,
  })
  if (isLoadingBalance) return <div>🤔🤔🤔</div>
  if (!data?.value) return <p>Couldn't get your balance! Weird, eh?</p>

  const [value, setValue] = useState('0.042069')

  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [successTx, setSuccessTx] = useState<ContractTransactionReceipt | null>(
    null
  )

  const referral = useAtomValue(referralAtom)

  useEffect(() => {
    const numericValue = parseFloat(value) || 0
    setIsValid(numericValue > 0 && numericValue <= +formatEther(data.value))
  }, [value, data.value])

  const signer = useEthersSigner()

  if (!signer) {
    return <p>Couldn't get your signer! Weird, eh?</p>
  }

  async function defend() {
    setIsLoading(true)
    setError(null)
    setSuccessTx(null)
    console.log(
      `Defending with ${value} ETH, referral ${referral} (${
        !!referral &&
        ethers.isAddress(referral) &&
        referral.toLowerCase() !== signer?.address.toLowerCase()
      })...`
    )
    try {
      const contract = castlesContract.connect(signer)
      const tx = await contract.defend(
        castle === CastleType.north ? 0 : 1,
        !!referral &&
          ethers.isAddress(referral) &&
          referral.toLowerCase() !== signer?.address.toLowerCase()
          ? referral
          : ethers.ZeroAddress,
        {
          value: ethers.parseEther(value.toString()),
        }
      )
      const txReceipt = await tx.wait()
      console.log(`Defended!`)
      setSuccessTx(txReceipt)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">How much ETH to defend with?</span>
        </div>
        <label
          class={`input input-bordered flex items-center gap-2 ${(!isValid && 'input-error') || ''}`}
        >
          <input
            type="number"
            placeholder="0.42069"
            class="grow"
            value={value}
            onChange={(e) => setValue(e.currentTarget.value || '0')}
          />
          ETH
        </label>
        <div class="label">
          <SuspenseWithError errorText="Failed to fetch balance...">
            <EnoughEthLabel value={value} />
            {/* <ProfitLabel value={value} castle={castle} /> */}
          </SuspenseWithError>
        </div>
      </label>
      <button
        class={`btn ${castle === CastleType.north ? 'btn-secondary' : 'btn-primary'} w-full`}
        disabled={!isValid || isLoading}
        onClick={defend}
      >
        {isLoading ? 'Defending...' : 'Defend!'}
      </button>
      <ErrorAlert error={error} />
      <SuccessTxAlert tx={successTx} castle={castle} />
    </div>
  )
}

export default function ({ castle }: { castle: CastleType }) {
  const { isConnected } = useAccount()
  return (
    <>
      <div className="mb-4">
        <ConnectButton />
      </div>
      {isConnected && <Defend castle={castle} />}
    </>
  )
}
