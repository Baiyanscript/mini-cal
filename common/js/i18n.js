// i18n.js - 自訂語言選擇系統(使用者可在設定頁手動選擇,不依賴系統語言自動偵測)
import storage from '@system.storage'
import zhCN from '../../i18n/zh-CN.json'
import zhTW from '../../i18n/zh-TW.json'
import en from '../../i18n/en.json'
import ja from '../../i18n/ja.json'

export var LANGUAGES = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' }
]

var TABLES = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en': en,
  'ja': ja
}

export function getLabels(code) {
  return TABLES[code] || zhCN
}

export function loadLanguage(onLoaded) {
  storage.get({
    key: 'appLanguage',
    success: function (data) {
      onLoaded(getLabels(data || 'zh-CN'))
    },
    fail: function () {
      onLoaded(getLabels('zh-CN'))
    }
  })
}

export function saveLanguage(code) {
  storage.set({
    key: 'appLanguage',
    value: code
  })
}
