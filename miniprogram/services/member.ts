import { get, post, put, del } from '../utils/http'
import { MEMBER_LIST, MEMBER_CREATE, MEMBER_DETAIL, MEMBER_ACTIONS, MEMBER_UPDATE_LABELS, MEMBER_RECHARGE , MEMBER_CONSUME, MEMBER_DELETE} from '../constants/apis'

// @ts-ignore
const replaceId = (uri: string, id: number): string => uri.replace('_id_', id)

type MemberListResult = { list: object[], lastId: number, isEnd: boolean }
export const getMemberList = (keyword?: string, lastId?: number): Promise<MemberListResult> => get(MEMBER_LIST, { keyword, lastId })

export const createMember = (data: object): Promise<any> => post(MEMBER_CREATE, data)

export const getMemberDetail = (id: number): Promise<{id: number, tel: string, name: string, carBodyNo: string, carLicenseNo: string, canWashCount: number, rechargeMoney: number, profile: { birthday: string }, photos: {car: string, vin: string}, labels: {id: number, name: string}[],}> => get(replaceId(MEMBER_DETAIL, id))

export const deleteMember = (id: number): Promise<any> => del(replaceId(MEMBER_DELETE, id))

export const getMemberActions = (id: number, lastId: number): Promise<{ lastId: number, isEnd: boolean, list: Array<object> }> => get(replaceId(MEMBER_ACTIONS, id), { lastId })

export const updateMemberLabels = (id: number, labelIds: number[]): Promise<any> => put(replaceId(MEMBER_UPDATE_LABELS, id), { labelIds })

export const memberRecharge = (id: number, data: {amount: number, counts: number, desc: string}): Promise<{ rechargeMoney: number, canWashCount: number }> => post(replaceId(MEMBER_RECHARGE, id), data)

export const memberConsume = (id: number): Promise<{ canWashCount: number }> => post(replaceId(MEMBER_CONSUME, id))