import { get } from '../utils/http'
import { LABEL_LIST } from "../constants/apis"

export const getLabelList = (): Promise<{ [key: number]: string }> => get(LABEL_LIST)