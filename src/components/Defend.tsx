import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ContractTransactionReceipt, ethers, formatEther } from 'ethers'
import castlesContract from 'helpers/castlesContract'
import useEthersSigner from 'hooks/useEthersSigner'
import CastleType from 'models/CastleType'
import { useEffect, useState } from 'preact/hooks'
import { useAccount, useBalance } from 'wagmi'
import TxLink from 'components/TxLink'

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
    try {
      const contract = castlesContract.connect(signer)
      const tx = await contract.defend(castle === CastleType.north ? 0 : 1, {
        value: ethers.parseEther(value.toString()),
      })
      const txReceipt = await tx.wait()
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
            onChange={(e) => setValue(e.currentTarget.value)}
          />
          ETH
        </label>
      </label>
      <button
        class={`btn ${castle === CastleType.north ? 'btn-secondary' : 'btn-primary'} w-full`}
        disabled={!isValid || isLoading}
        onClick={defend}
      >
        {isLoading ? 'Defending...' : 'Defend!'}
      </button>
      {error && (
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
      )}
      {successTx && (
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
            <TxLink hash={successTx.hash}>
              <span className="text-primary-content no-underline hover:underline">
                transaction
              </span>
            </TxLink>
            .
          </span>
        </div>
      )}
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
