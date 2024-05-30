import { PropsWithChildren } from 'preact/compat'
import { Provider } from 'jotai'
import { store } from 'atoms/contract'
import { eventsStore } from 'atoms/events'

export default function ({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <Provider store={eventsStore}>{children}</Provider>
    </Provider>
  )
}
