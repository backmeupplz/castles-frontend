import { balancesAtom } from 'atoms/contract'
import { useAtomValue } from 'jotai'
import SuspenseWithError from 'components/SuspenseWithError'
import CastleType from 'models/CastleType'
import { formatEther } from 'ethers'

function Status({ castle }: { castle: CastleType }) {
  const balances = useAtomValue(balancesAtom)
  return (
    <span>
      {balances[0] === balances[1]
        ? 'tied'
        : castle === CastleType.north
          ? balances[0] > balances[1]
            ? 'winning'
            : 'losing'
          : balances[1] > balances[0]
            ? 'winning'
            : 'losing'}
    </span>
  )
}

function TotalContributed({ castle }: { castle: CastleType }) {
  const balances = useAtomValue(balancesAtom)
  return (
    <span>
      {formatEther(castle === CastleType.north ? balances[0] : balances[1])} ETH
    </span>
  )
}

export default function ({ castle }: { castle: CastleType }) {
  return (
    <ul>
      <li>
        Currently{' '}
        <SuspenseWithError errorText="Error fetching round ID">
          <Status castle={castle} />
        </SuspenseWithError>
      </li>
      <li>
        Total contributed for defence:{' '}
        <SuspenseWithError errorText="Error fetching round ID">
          <TotalContributed castle={castle} />
        </SuspenseWithError>
      </li>
    </ul>
  )
}
