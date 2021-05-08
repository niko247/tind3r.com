/* eslint-disable no-param-reassign */
import { EXT_ID } from 'const';

const chromeRuntime = (type, url, params, withToken) =>
    new Promise((resolve, reject) => {
      console.log("chrome runtime");
      chrome.runtime.sendMessage(EXT_ID(), { type, url, params, withToken }, (response) => {
        if (!response) {
          reject();
          return;
        }

        if (response.success) {
          resolve(response.resp);
        } else {
          reject(response.resp);
        }
      });
    });

console.log("config");
if(chrome.runtime) {
  chrome.runtime.sendMessage(EXT_ID(), {
    type: 'CONFIG',
    configObj: {
      baseURL: 'https://api.gotinder.com/',
      timeout: 30000,
    },
  });
  console.log("attach");
  chrome.runtime.sendMessage(EXT_ID(), {
    type: 'ATTACH_HEADERS',
    host: '*://api.gotinder.com/*',
    callback: `(details) => {
    details.requestHeaders.forEach((header) => {
      if (header.name === 'User-Agent') {
        header.value = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.68 Safari/537.36';
      }
      if (header.name === 'platform') {
         header.value = 'web';
      }
      if (header.name === 'Origin') {
        header.value = '';
      }
    });
    return { requestHeaders: details.requestHeaders };
  }`,
  });

}
export const get = (url, params, withToken = true) => chromeRuntime('GET', url, params, withToken);

export const post = (url, params, withToken = true) => chromeRuntime('POST', url, params, withToken);

export const del = (url, params, withToken = true) => chromeRuntime('DELETE', url, params, withToken);

export default {
  get,
  post,
  del,
};
