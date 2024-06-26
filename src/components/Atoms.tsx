import { PropsWithChildren } from 'preact/compat'
import { Provider } from 'jotai'
import store from 'atoms/store'

export default function ({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>
}
