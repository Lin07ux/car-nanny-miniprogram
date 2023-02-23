import { get, post, del } from '../utils/http'
import { LABEL_LIST, LABEL_CREATE, LABEL_DELETE } from "../constants/apis"

export const getLabelList = (): Promise<{ [key: number]: string }> => get(LABEL_LIST)

export const createLabel = (name: string): Promise<{id: number, name: string}> => post(LABEL_CREATE, { name })

// @ts-ignore
export const deleteLabel = (id: number): Promise<any> => del(LABEL_DELETE.replace('_id_', id))