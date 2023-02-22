import { get, post } from '../utils/http'
import { MEMBER_LIST, MEMBER_CREATE, MEMBER_DETAIL, MEMBER_ACTIONS } from '../constants/apis'

type MemberListResult = { list: object[], lastId: number, isEnd: boolean }
export const getMemberList = (keyword?: string, lastId?: number): Promise<MemberListResult> => get(MEMBER_LIST, { keyword, lastId })

export const createMember = (data: object): Promise<any> => post(MEMBER_CREATE, data)

// @ts-ignore
export const getMemberDetail = (id: number): Promise<object> => get(MEMBER_DETAIL.replace('_id_', id))

// @ts-ignore
export const getMemberActions = (id: number): Promise<object> => get(MEMBER_ACTIONS.replace('_id_', id))