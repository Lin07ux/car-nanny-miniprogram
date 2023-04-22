import { STATISTICS_CAR_WASH } from '../constants/apis'
import { get } from '../utils/http'

export const getCarWashActions = (params: object, lastId: number) => get(STATISTICS_CAR_WASH, { ...params, lastId })
export const downloadCarWash = (params: object) => get(STATISTICS_CAR_WASH, { ...params, download: true })