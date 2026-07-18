// unlock.js - 小米手环解锁码计算
// 演算法: SHA256(MAC+SN+"XIAOMI") 或 SHA256(SN+MAC+"XIAOMI")(新版算法),
// 取雜湊結果前10個位元組,各自 mod 10 組成10位數解鎖碼

function rotr(x, n) {
  return (x >>> n) | (x << (32 - n))
}

var K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]

// 標準SHA-256,輸入為binary string,回傳64字元hex字串
export function sha256(input) {
  var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]
  var bitLen = input.length * 8

  input += String.fromCharCode(0x80)
  while (input.length % 64 !== 56) {
    input += String.fromCharCode(0)
  }
  for (var shift = 56; shift >= 0; shift -= 8) {
    input += String.fromCharCode((bitLen / Math.pow(2, shift)) & 255)
  }

  for (var block = 0; block < input.length; block += 64) {
    var w = new Array(64)
    for (var i = 0; i < 16; i++) {
      w[i] = (input.charCodeAt(block + 4 * i) << 24) |
        (input.charCodeAt(block + 4 * i + 1) << 16) |
        (input.charCodeAt(block + 4 * i + 2) << 8) |
        (input.charCodeAt(block + 4 * i + 3))
    }
    for (i = 16; i < 64; i++) {
      var s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)
      var s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0
    }

    var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7]

    for (i = 0; i < 64; i++) {
      var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)
      var ch = (e & f) ^ (~e & g)
      var temp1 = (hh + S1 + ch + K[i] + w[i]) | 0
      var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)
      var maj = (a & b) ^ (a & c) ^ (b & c)
      var temp2 = (S0 + maj) | 0

      hh = g; g = f; f = e; e = (d + temp1) | 0
      d = c; c = b; b = a; a = (temp1 + temp2) | 0
    }

    h[0] = (h[0] + a) | 0
    h[1] = (h[1] + b) | 0
    h[2] = (h[2] + c) | 0
    h[3] = (h[3] + d) | 0
    h[4] = (h[4] + e) | 0
    h[5] = (h[5] + f) | 0
    h[6] = (h[6] + g) | 0
    h[7] = (h[7] + hh) | 0
  }

  var out = ''
  for (i = 0; i < 8; i++) {
    for (var shift2 = 24; shift2 >= 0; shift2 -= 8) {
      var byte = (h[i] >> shift2) & 255
      out += (byte < 16 ? '0' : '') + byte.toString(16)
    }
  }
  return out
}

export function hexToBytes(hex) {
  var bytes = []
  for (var i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16))
  }
  return bytes
}

// mac: 蓝牙地址(会自动过滤成纯16进制字元), sn: 序列号, useNewAlgo: true=新版算法(S5/10P及以后,顺序SN+MAC),false=旧版(MAC+SN)
export function calcUnlockCode(mac, sn, useNewAlgo) {
  var cleanMac = mac.toUpperCase().replace(/[^0-9A-F]/g, '')
  var cleanSn = sn.toUpperCase().trim()
  var input = useNewAlgo ? (cleanSn + cleanMac + 'XIAOMI') : (cleanMac + cleanSn + 'XIAOMI')
  var bytes = hexToBytes(sha256(input))
  var code = ''
  for (var i = 0; i < 10; i++) {
    code += String(bytes[i] % 10)
  }
  return code
}
