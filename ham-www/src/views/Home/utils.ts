import { Ham } from '../../ham'

import {
  getCurrentPrice as gCP,
  getTargetPrice as gTP,
  getCirculatingSupply as gCS,
  getNextRebaseTimestamp as gNRT,
  getTotalSupply as gTS,
} from '../../hamUtils'

const getCurrentPrice = async (yam: typeof Ham): Promise<number> => {
  // FORBROCK: get current HAM price
  return gCP(yam)
}

const getTargetPrice = async (yam: typeof Ham): Promise<number> => {
  // FORBROCK: get target HAM price
  return gTP(yam)
}

const getCirculatingSupply = async (yam: typeof Ham): Promise<string> => {
  // FORBROCK: get circulating supply
  return gCS(yam)
}

const getNextRebaseTimestamp = async (yam: typeof Ham): Promise<number> => {
  // FORBROCK: get next rebase timestamp
  const nextRebase = await gNRT(yam) as number
  return nextRebase * 1000
}

const getTotalSupply = async (yam: typeof Ham): Promise<string> => {
  // FORBROCK: get total supply
  return gTS(yam)
}

export const getStats = async (yam: typeof Ham) => {
  const curPrice = await getCurrentPrice(yam)
  const circSupply = '' // await getCirculatingSupply(ham)
  const nextRebase = await getNextRebaseTimestamp(yam)
  const targetPrice = await getTargetPrice(yam)
  const totalSupply = await getTotalSupply(yam)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}
