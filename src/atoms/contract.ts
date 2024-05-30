import castlesContract from 'helpers/castlesContract'
import provider from 'helpers/provider'
import { atom, createStore } from 'jotai'

export const store = createStore()

export const blockNumberAtom = atom(provider.getBlockNumber())
provider.on('block', (blockNumber) => {
  store.set(blockNumberAtom, blockNumber)
})

export const roundDurationAtom = atom(castlesContract.roundDuration())
castlesContract.on(
  castlesContract.filters.RoundDurationSet,
  (roundDuration) => {
    store.set(roundDurationAtom, Promise.resolve(roundDuration))
  }
)

export const maxFeeAtom = atom(castlesContract.maxFee())
castlesContract.on(castlesContract.filters.MaxFeeSet, (maxFee) => {
  store.set(maxFeeAtom, Promise.resolve(maxFee))
})

export const balancesAtom = atom(
  castlesContract
    .currentRoundId()
    .then((roundId) => castlesContract.getRound(roundId))
    .then((round) => [round.northBalance, round.southBalance])
)

castlesContract.on(castlesContract.filters.Defended, () => {
  store.set(
    balancesAtom,
    castlesContract
      .currentRoundId()
      .then((roundId) => castlesContract.getRound(roundId))
      .then((round) => [round.northBalance, round.southBalance])
  )
})

export const roundIdAtom = atom(castlesContract.currentRoundId())
castlesContract.on(castlesContract.filters.RoundStarted, (roundId) => {
  store.set(roundIdAtom, Promise.resolve(roundId))
  store.set(
    balancesAtom,
    castlesContract
      .getRound(roundId)
      .then((round) => [round.northBalance, round.southBalance])
  )
})

export const roundAtom = atom(async (get) => {
  const roundId = await get(roundIdAtom)
  return castlesContract.getRound(roundId)
})

export const feeAtom = atom(async (get) => {
  const currentBlock = await get(blockNumberAtom)
  const roundDuration = await get(roundDurationAtom)
  const { startBlock } = await get(roundAtom)
  const blocksElapsed = currentBlock - Number(startBlock)
  const maxFee = await get(maxFeeAtom)
  if (blocksElapsed >= roundDuration) {
    return maxFee
  }
  return (maxFee * BigInt(blocksElapsed)) / roundDuration
})
