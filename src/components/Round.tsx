import { ethers } from 'ethers'
import castlesContract from 'helpers/castlesContract'
import useEthersSigner from 'hooks/useEthersSigner'
import { useEffect, useState } from 'preact/hooks'

function RoundResults({ roundId }: { roundId: number }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [startBlock, setStartBlock] = useState<bigint | null>(null)
  const [endBlock, setEndBlock] = useState<bigint | null>(null)
  const [northBalance, setNorthBalance] = useState<bigint | null>(null)
  const [southBalance, setSouthBalance] = useState<bigint | null>(null)

  useEffect(() => {
    async function fetchRound(id: number) {
      setIsLoading(true)
      setError(null)
      try {
        const { startBlock, endBlock, northBalance, southBalance } =
          await castlesContract.getRound(id)
        if (roundId !== id) {
          return
        }
        setStartBlock(startBlock)
        setEndBlock(endBlock)
        setNorthBalance(northBalance)
        setSouthBalance(southBalance)
      } catch (error) {
        console.error(error)
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRound(roundId)
  }, [roundId])

  if (isLoading) {
    return <p>🤔🤔🤔</p>
  }

  if (!startBlock || !endBlock || !northBalance || !southBalance) {
    return <p>Round not found</p>
  }

  if (error) {
    return (
      <div role="alert" class="alert alert-error break-all">
        Error: {error.message}
      </div>
    )
  }

  const signer = useEthersSigner()

  return (
    <ul>
      <li>
        Blocks {startBlock}...{endBlock}
      </li>
      <li>North castle: {ethers.formatEther(northBalance)} ETH</li>
      <li>South castle: {ethers.formatEther(southBalance)} ETH</li>
      <li>
        {northBalance > southBalance
          ? 'North castle won!'
          : southBalance > northBalance
            ? 'South castle won!'
            : 'Oh my, oh my, a draw!'}
      </li>
      {!!signer && (
        <button
          className="btn btn-sm btn-accent"
          onClick={async () => {
            try {
              await castlesContract.connect(signer).withdraw(roundId)
            } catch (error) {
              console.error(error instanceof Error ? error.message : error)
              setError(
                error instanceof Error ? error : new Error('Unknown error')
              )
            }
          }}
        >
          Claim booty (if you won or drew)!
        </button>
      )}
    </ul>
  )
}

export default function ({ roundId }: { roundId: number }) {
  return (
    <>
      <h3>Round #{roundId}</h3>
      <RoundResults roundId={roundId} />
    </>
  )
}
