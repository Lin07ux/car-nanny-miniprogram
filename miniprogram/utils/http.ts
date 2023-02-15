import { isDevelop, REQUEST_DOMAIN } from '../constants/common'

const interceptorsResponse = <T>(
  res: WechatMiniprogram.RequestSuccessCallbackResult | WechatMiniprogram.UploadFileSuccessCallbackResult,
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void
): void => {
  if (200 <= res.statusCode && res.statusCode < 300) {
    return resolve(res.data as T);
  }

  // 重新登录
  if (res.statusCode === 401) {
    gotoLoginPage()
  }

  const { code = 0, message = '接口错误' } = res.data as { code?: number, message?: string }

  return reject({ code, message });
};

const gotoLoginPage = () => {
  //
}

const getToken = () => getApp().globalData.user.token

const http = (method: 'POST' | 'PUT' | 'GET' | 'DELETE', path: string, data: any) => {
  return new Promise(async (resolve, reject) => {    
    wx.request({
      url: `${REQUEST_DOMAIN}${path}`,
      data,
      method,
      dataType: 'json',
      enableHttp2: ! isDevelop,
      header: {
        'authorization': getToken(),
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      success(res: WechatMiniprogram.RequestSuccessCallbackResult) {
        interceptorsResponse(res, resolve, reject);
      },
      fail(err : WechatMiniprogram.Err) {
        reject({ code: err.errno, message: err.errMsg });
      },
    });
  });
};

export const get = (url: string, params ?: any) : Promise<any> => http('GET', url, params);
export const put = (url: string, params ?: any) : Promise<any> => http('PUT', url, params);
export const post = (url: string, params ?: any) : Promise<any> => http('POST', url, params);
export const del = (url: string, params ?: any) : Promise<any> => http('DELETE', url, params);

// 文件上传
export const upload = (url : string, filePath : string, name : string = 'file', formData ?: object): Promise<any> => {
  return new Promise(async function (resolve, reject) {
    wx.uploadFile({
      url: `${REQUEST_DOMAIN}${url}`,
      name,
      filePath,
      formData,
      header: {
        'X-Requested-With': 'XMLHttpRequest',
        'content-type': 'multipart/form-data',
        'authorization': getToken(),
      },
      success(res: WechatMiniprogram.UploadFileSuccessCallbackResult) {
        try {
          res.data = res.data ? JSON.parse(res.data) : res.data
        } catch(err) {
          console.log(err)
        }

        interceptorsResponse(res, resolve, reject);
      },
      fail(err : WechatMiniprogram.GeneralCallbackResult) {
        reject({ code: 0, message: err.errMsg });
      },
    })
  })
}