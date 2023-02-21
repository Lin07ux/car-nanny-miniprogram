import { upload } from '../utils/http'
import { UPLOAD_IMAGE } from '../constants/apis'

export const uploadImage = (type: string, file: string) => upload(UPLOAD_IMAGE, file, 'image', { type })