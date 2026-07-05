// vibrate.js - 共用震動輔助函式
import vibrator from '@system.vibrator'
import storage from '@system.storage'

export function vibrateShort() {
  storage.get({
    key: 'vibrationEnabled',
    success: function (data) {
      if (data === null || data === undefined || data === '' || data === 'true') {
        vibrator.vibrate({ mode: 'short' })
      }
    },
    fail: function () {
      vibrator.vibrate({ mode: 'short' })
    }
  })
}
