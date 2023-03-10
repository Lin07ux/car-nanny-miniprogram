import { get, post, put, del, upload } from '../utils/http'
import { MEMBER_LIST, MEMBER_CREATE, MEMBER_DETAIL, MEMBER_ACTIONS, MEMBER_UPDATE_LABELS, MEMBER_RECHARGE , MEMBER_CONSUME, MEMBER_UPDATE, MEMBER_DELETE, MEMBER_STATISTICS } from '../constants/apis'

// @ts-ignore
const replaceId = (uri: string, id: number): string => uri.replace('_id_', id)

type MemberListResult = {
  list: {
    id: number,
    name: string,
    tel: string,
    isVip: boolean,
    carLicenseNo: string,
    cover: string,
    canWashCount: number,
    lastConsumerTime: string,
  },
  lastId: number,
  isEnd: boolean,
}
export const getMemberList = (type: string, keyword: string, lastId: number): Promise<MemberListResult> => get(MEMBER_LIST, { type, keyword, lastId })

export const createMember = (data: object): Promise<any> => post(MEMBER_CREATE, data)

export const getMemberDetail = (id: number): Promise<{id: number, tel: string, name: string, carBodyNo: string, carLicenseNo: string, canWashCount: number, rechargeMoney: number, profile: { birthday: string }, photos: {car?: string, vin?: string}, labels: {id: number, name: string}[],}> => get(replaceId(MEMBER_DETAIL, id))

export const updateMember = (id: number, data: object): Promise<any> => put(replaceId(MEMBER_UPDATE, id), data)

export const deleteMember = (id: number): Promise<any> => del(replaceId(MEMBER_DELETE, id))

export const getMemberActions = (id: number, lastId: number): Promise<{ lastId: number, isEnd: boolean, list: Array<{id: number, image: string}> }> => get(replaceId(MEMBER_ACTIONS, id), { lastId })

export const updateMemberLabels = (id: number, labelIds: number[]): Promise<any> => put(replaceId(MEMBER_UPDATE_LABELS, id), { labelIds })

export const memberRecharge = (id: number, data: {amount: number, counts: number, desc: string}): Promise<{ rechargeMoney: number, canWashCount: number }> => post(replaceId(MEMBER_RECHARGE, id), data)

export const memberConsume = (id: number, file: string): Promise<{ canWashCount: number }> => upload(replaceId(MEMBER_CONSUME, id), file, 'image')

export const getMemberStatistics = (): Promise<{ total: number, monthNewly: number, birthday: number, active: number, churn: number, unRecharged: number, imprefect: number }> => get(MEMBER_STATISTICS)