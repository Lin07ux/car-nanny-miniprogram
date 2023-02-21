import { get, post } from '../utils/http'
import { MEMBER_LIST, MEMBER_CREATE } from '../constants/apis'

type MemberListResult = { list: object[], lastId: number, isEnd: boolean }
export const getMemberList = (keyword?: string, lastId?: number): Promise<MemberListResult> => get(MEMBER_LIST, { keyword, lastId })

export const createMember = (data: object): Promise<any> => post(MEMBER_CREATE, data)