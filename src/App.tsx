import { maxFeeAtom, roundDurationAtom } from 'atoms/contract'
import Atoms from 'components/Atoms'
import Castle from 'components/Castle'
import ContractState from 'components/ContractState'
import Events from 'components/Events'
import History from 'components/History'
import Link from 'components/Link'
import SuspenseWithError from 'components/SuspenseWithError'
import Wallet from 'components/Wallet'
import env from 'helpers/env'
import { useAtomValue } from 'jotai'
import CastleType from 'models/CastleType'

function SuspendedFee() {
  const fee = useAtomValue(maxFeeAtom)
  return <span>{fee}%</span>
}

function SuspendedRoundDuration() {
  const roundDuration = useAtomValue(roundDurationAtom)
  return (
    <span>
      {((Number(roundDuration) * 2) / 60 / 60).toFixed(2)} hours (
      {roundDuration} blocks)
    </span>
  )
}

export default function () {
  return (
    <Wallet>
      <Atoms>
        <div className="container mx-auto max-w-prose p-10 prose">
          <h1>Welcome to 🏰🏰!</h1>
          <h2>The first pay-to-win blockchain game</h2>
          <ul>
            <li>There are two castles: North and South</li>
            <li>Both are under siege</li>
            <li>Choose which one you defend and deposit ETH</li>
            <li>
              Round lasts roughly{' '}
              <SuspenseWithError errorText="🥲">
                <SuspendedRoundDuration />
              </SuspenseWithError>
            </li>
            <li>Whichever castle has more ETH deposited wins</li>
            <li>
              Winners split the losing castle's ETH proportionally and get their
              defense ETH back
            </li>
            <li>
              Be early: fees linearly increase from 0% to{' '}
              <SuspenseWithError errorText="🥲">
                <SuspendedFee />
              </SuspenseWithError>{' '}
              the closer we are to the end of round
            </li>
            <li>
              If you deposit after the round is over, you kick off the next
              round
            </li>
            <li>
              Check out the verified smart contract{' '}
              <Link
                url={`https://sepolia.basescan.org/address/${env.VITE_CONTRACT_ADDRESS}`}
              >
                here
              </Link>
              !
            </li>
          </ul>
          <h3>May the richest 🏰 win!</h3>
          <h1>Round stats ⚔️</h1>
          <ContractState />
          <h1 className="text-secondary">North castle ❄️</h1>
          <Castle castle={CastleType.north} />
          <h1 className="text-error">South castle 🔥</h1>
          <Castle castle={CastleType.south} />
          <h1>Recent events 👀</h1>
          <Events />
          <h1>Previous rounds 👴</h1>
          <History />
        </div>
      </Atoms>
    </Wallet>
  )
}
