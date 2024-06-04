import Link from 'components/Link'
import { PropsWithChildren } from 'preact/compat'

export default function ({
  hash,
  children,
}: { hash: string } & PropsWithChildren) {
  return <Link url={`https://basescan.org/tx/${hash}`}>{children}</Link>
}
