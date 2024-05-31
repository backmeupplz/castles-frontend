import { ethers } from 'ethers'
import { atomWithStorage } from 'jotai/utils'

export const referralAtom = atomWithStorage('referral', ethers.ZeroAddress)
