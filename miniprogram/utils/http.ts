import { isDevelop, REQUEST_DOMAIN } from '../constants/common'

const interceptorsResponse = <T>(
  res: WechatMiniprogram.RequestSuccessCallbackResult | WechatMiniprogram.UploadFileSuccessCallbackResult,
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void
): void => {
  const data = res.data as { code?: number, msg?: string, data?: any }

  if (200 <= res.statusCode && res.statusCode < 300) {
    return resolve(data.data as T);
  }

  // 重新登录
  if (res.statusCode === 401) {
    gotoLoginPage()
  }

  return reject({ code: data.code || 0, message: data.msg || '接口错误' });
};

const gotoLoginPage = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const loginPage = 'pages/login/login'

  if (currentPage.route !== loginPage) {
    wx.navigateTo({ url: '/'+loginPage })
  }
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