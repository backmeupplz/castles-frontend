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
import Username from './Username'

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
  return (
    <>
      {events.map((event, i) => (
        <li key={i}>
          <Username address={event.args.defender} />{' '}
          <TxLink hash={event.transactionHash}>defended</TxLink>{' '}
          {event.args.castle === 0n ? 'north' : 'south'} castle with{' '}
          {formatEther(event.args.amount)} ETH at round #{event.args.roundId}
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
