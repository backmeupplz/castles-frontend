import {
  blockNumberAtom,
  roundDurationAtom,
  maxFeeAtom,
  roundIdAtom,
  roundAtom,
  feeAtom,
  balancesAtom,
} from 'atoms/contract'
import { useAtomValue } from 'jotai'
import SuspenseWithError from 'components/SuspenseWithError'
import { formatEther } from 'ethers'

function RoundId() {
  const roundId = useAtomValue(roundIdAtom)
  return <span>#{Number(roundId)}</span>
}

function Fee() {
  const fee = useAtomValue(feeAtom)
  const maxFee = useAtomValue(maxFeeAtom)
  return (
    <span>
      {Number(fee)}%/{Number(maxFee)}%
    </span>
  )
}

function BlockNumber() {
  const blockNumber = useAtomValue(blockNumberAtom)
  return <span>{blockNumber}</span>
}

function RoundDuration() {
  const roundDuration = useAtomValue(roundDurationAtom)
  const { startBlock } = useAtomValue(roundAtom)
  const currentBlock = useAtomValue(blockNumberAtom)
  const blocksElapsed = currentBlock - Number(startBlock)
  const duration = Number(roundDuration) - blocksElapsed
  return (
    <span>
      {duration <= 0
        ? 'Round is over! Defend one of the castles to start the new one!'
        : `Blocks left: ${duration} (~${((duration * 2) / 60 / 60).toFixed(2)} hours)`}
    </span>
  )
}

function TotalContributions() {
  const [northBalance, southBalance] = useAtomValue(balancesAtom)
  return <span>{formatEther(northBalance + southBalance)} ETH</span>
}

export default function () {
  return (
    <ul>
      <li>
        Round:{' '}
        <SuspenseWithError errorText="Error fetching round ID">
          <RoundId />
        </SuspenseWithError>
      </li>
      <li>
        Current fee:{' '}
        <SuspenseWithError errorText="Error fetching current fee">
          <Fee />
        </SuspenseWithError>
      </li>
      <li>
        Current block:{' '}
        <SuspenseWithError errorText="Error fetching block number">
          <BlockNumber />
        </SuspenseWithError>
      </li>
      <li>
        Total contributed this round:{' '}
        <SuspenseWithError errorText="Error fetching balances">
          <span>
            <TotalContributions />
          </span>
        </SuspenseWithError>
      </li>
      <li>
        <SuspenseWithError errorText="Error fetching round duration">
          <span>
            <RoundDuration />
          </span>
        </SuspenseWithError>
      </li>
    </ul>
  )
}
