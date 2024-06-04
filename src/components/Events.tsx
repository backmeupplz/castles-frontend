import { eventsAtom, newEventsAtom } from 'atoms/events'
import { useAtomValue } from 'jotai'
import SuspenseWithError from './SuspenseWithError'
import { formatEther } from 'ethers'
import TxLink from 'components/TxLink'
import {
  TypedContractEvent,
  TypedEventLog,
} from 'castles-contract/dist/typechain/common'
import { DefendedEvent } from 'castles-contract/dist/typechain/contracts/Castles'
import Username from 'components/Username'
import Link from 'components/Link'
import { useAccount } from 'wagmi'

function EventList({
  events,
}: {
  events: TypedEventLog<
    TypedContractEvent<
      DefendedEvent.InputTuple,
      DefendedEvent.OutputTuple,
      DefendedEvent.OutputObject
    >
  >[]
}) {
  const { address } = useAccount()
  return (
    <>
      {events.map((event, i) => (
        <li key={i}>
          <Username address={event.args.defender} />{' '}
          <TxLink
            hash={event.transactionHash || (event as any).log.transactionHash}
          >
            defended
          </TxLink>{' '}
          {event.args.castle === 0n ? 'north' : 'south'} castle with{' '}
          {formatEther(event.args.amount)} ETH at round #{event.args.roundId}
          {address && address === event.args.defender && (
            <span>
              {' '}
              (
              <Link
                url={`https://warpcast.com/~/compose?text=I%20defended%20the%20${event.args.castle === 0n ? 'north' : 'south'}%20castle!%20Come%20fight%20me%20at%20castles.lol%20⚔️&embeds[]=https://castles.lol?r=${event.args.defender}`}
              >
                Share to Farcaster
              </Link>
              )
            </span>
          )}
        </li>
      ))}
    </>
  )
}

function NewEvents() {
  const events = useAtomValue(newEventsAtom)
  return <EventList events={events} />
}

function EventsSuspended() {
  const events = useAtomValue(eventsAtom)
  return (
    <ul>
      <NewEvents />
      <EventList events={events} />
    </ul>
  )
}

export default function () {
  return (
    <SuspenseWithError errorText="Error fetching events">
      <EventsSuspended />
    </SuspenseWithError>
  )
}
