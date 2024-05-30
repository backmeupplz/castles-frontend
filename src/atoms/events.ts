import {
  TypedContractEvent,
  TypedEventLog,
} from 'castles-contract/dist/typechain/common'
import { DefendedEvent } from 'castles-contract/dist/typechain/contracts/Castles'
import castlesContract from 'helpers/castlesContract'
import { atom, createStore } from 'jotai'

export const eventsStore = createStore()

export const eventsAtom = atom(
  castlesContract.queryFilter(castlesContract.filters.Defended)
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
  console.log('new defended event', args)
  const eventLog = args[4]
  eventsStore.set(newEventsAtom, (events) => [eventLog, ...events])
})
