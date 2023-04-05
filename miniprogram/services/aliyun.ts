import { post } from '../utils/http'
import { ALIYUN_OSS_IMAGE, ALIYUN_LICENSE_PLATE } from '../constants/apis'

type ossImageResult = {
  path: string,
  host: string,
  policy: string,
  signature: string,
  accessKeyId: string,
  securityToken: string,
}

// 获取图片文件扩展名
const getImageExt = (file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: file,
      success: (res: WechatMiniprogram.GetImageInfoSuccessCallbackResult) => resolve(res.type),
      fail: res => {
        console.error(res)
        reject('无法获取图片格式')
      },
    })
  })
}

// OSS 上传文件
const ossPostObject = (filePath: string, options: ossImageResult): Promise<string> => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: options.host,
      name: 'file',
      filePath,
      formData: {
        key: options.path,
        policy: options.policy,
        signature: options.signature,
        OSSAccessKeyId: options.accessKeyId,
        'x-oss-security-token': options.securityToken, // 使用 STS 签名时必传
      },
      success: res => res.statusCode === 204 ? resolve(`${options.host}/${options.path}`) : reject(res),
      fail: err => {
        console.error(err)
        reject('OSS 文件上传失败')
      },
    })
  })
}

export const uploadOssImage = (type: string, file: string): Promise<string> => {
  return getImageExt(file)
    .then((ext: string) => post(ALIYUN_OSS_IMAGE, { type, ext }))
    .then((res: ossImageResult) => ossPostObject(file, res))
}

export const recognizeLicensePlate = (url: string): Promise<{id: number, plateType: string, plateNumber: string}> => post(ALIYUN_LICENSE_PLATE, { url })
