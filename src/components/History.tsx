import { useAtomValue } from 'jotai'
import SuspenseWithError from 'components/SuspenseWithError'
import { roundIdAtom } from 'atoms/contract'
import Round from './Round'

function HistorySuspended() {
  const currentRoundId = useAtomValue(roundIdAtom)
  return (
    <>
      {Array(Number(currentRoundId) - 1)
        .fill(0)
        .map((_, i) => (
          <Round roundId={i + 1} />
        ))}
    </>
  )
}

export default function () {
  return (
    <SuspenseWithError errorText="Failed to fetch history...">
      <HistorySuspended />
    </SuspenseWithError>
  )
}
