import { get, post } from '../utils/http'
import { LABEL_LIST, LABEL_CREATE } from "../constants/apis"

export const getLabelList = (): Promise<{ [key: number]: string }> => get(LABEL_LIST)

export const createLabel = (name: string): Promise<{id: number, name: string}> => post(LABEL_CREATE, { name })