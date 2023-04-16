import { get } from '../utils/http'
import { SHARE_HOME } from "../constants/apis"

export const shareHomePage = function () {
  return {
    title: '车保姆',
    path: '/pages/home/home',
    imageUrl: '',
    promise: get(SHARE_HOME),
  }
}