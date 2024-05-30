import Atoms from 'components/Atoms'
import Castle from 'components/Castle'
import ContractState from 'components/ContractState'
import Wallet from 'components/Wallet'
import CastleType from 'models/CastleType'

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
            <li>Round lasts roughly 24 hours (6500 blocks)</li>
            <li>Whichever castle has more ETH deposited wins</li>
            <li>
              Winners split the losing castle's ETH proportionally and get their
              defense ETH back
            </li>
            <li>
              Be early: fees linearly increase from 0% to 20% the closer we are
              to the end of round
            </li>
            <li>
              If you deposit after the round is over, you kick off the next
              round
            </li>
          </ul>
          <h3>May the richest 🏰 win!</h3>
          <h1>Round stats ⚔️</h1>
          <ContractState />
          <h1 className="text-secondary">North castle ❄️</h1>
          <Castle castle={CastleType.north} />
          <h1 className="text-error">South castle 🔥</h1>
          <Castle castle={CastleType.south} />
        </div>
      </Atoms>
    </Wallet>
  )
}
