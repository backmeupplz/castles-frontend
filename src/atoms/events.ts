import {
  TypedContractEvent,
  TypedEventLog,
} from 'castles-contract/dist/typechain/common'
import { DefendedEvent } from 'castles-contract/dist/typechain/contracts/Castles'
import castlesContract from 'helpers/castlesContract'
import { atom } from 'jotai'
import store from 'atoms/store'

export const eventsAtom = atom(
  castlesContract
    .queryFilter(castlesContract.filters.Defended)
    .then((logs) => logs.reverse())
)
export const newEventsAtom = atom<
  TypedEventLog<
    TypedContractEvent<
      DefendedEvent.InputTuple,
      DefendedEvent.OutputTuple,
      DefendedEvent.OutputObject
    >
  >[]
>([])

castlesContract.on(castlesContract.filters.Defended, (...args) => {
  const eventLog = args[5]
  store.set(newEventsAtom, (events) => [eventLog, ...events])
})
