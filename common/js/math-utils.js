// math-utils.js - 数学运算工具函式库

// 表达式求值：支持 + - * / ^ sin cos tan sqrt log π e
export function evaluate(expression) {
  if (!expression) {
    throw new Error('表达式为空')
  }

  var expr = expression
  expr = expr.split('π').join('(' + Math.PI + ')')
  expr = expr.split('e').join('(' + Math.E + ')')
  expr = expr.split('√').join('Math.sqrt')
  expr = expr.split('^').join('**')
  expr = expr.split('sin').join('Math.sin')
  expr = expr.split('cos').join('Math.cos')
  expr = expr.split('tan').join('Math.tan')
  expr = expr.split('log').join('Math.log10')

  var fn = new Function('return (' + expr + ')')
  var result = fn()

  if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
    throw new Error('计算结果无效')
  }
  return result
}

// 小数转分数（连分数法）
export function toFraction(decimal) {
  var tolerance = 1.0E-6
  if (decimal === 0) return '0'
  if (Math.abs(decimal - Math.round(decimal)) < tolerance) {
    return String(Math.round(decimal))
  }

  var h1 = 1, h2 = 0
  var k1 = 0, k2 = 1
  var b = decimal
  var i = 0

  do {
    var a = Math.floor(b)
    var aux = h1
    h1 = a * h1 + h2
    h2 = aux
    aux = k1
    k1 = a * k1 + k2
    k2 = aux
    b = 1 / (b - a)
    i++
  } while (Math.abs(decimal - h1 / k1) > decimal * tolerance && i < 30)

  return h1 + '/' + k1
}

export function toDecimal(fraction) {
  var parts = String(fraction).split('/')
  if (parts.length !== 2) return parseFloat(fraction)
  return parseFloat(parts[0]) / parseFloat(parts[1])
}

// 一元一次方程 ax + b = 0
export function solveLinear(a, b) {
  if (a === 0) throw new Error('不是一元一次方程')
  return -b / a
}

// 一元二次方程 ax^2 + bx + c = 0
export function solveQuadratic(a, b, c) {
  if (a === 0) return solveLinear(b, c)
  var discriminant = b * b - 4 * a * c
  if (discriminant < 0) return null
  if (discriminant === 0) return [-b / (2 * a)]
  var x1 = (-b + Math.sqrt(discriminant)) / (2 * a)
  var x2 = (-b - Math.sqrt(discriminant)) / (2 * a)
  return [x1, x2]
}

// 一元一次不等式 ax + b [运算子] 0
export function solveLinearInequality(a, b, operator) {
  if (a === 0) throw new Error('系数a不可为0')
  var solution = -b / a
  var flip = a < 0
  var op = operator
  if (flip) {
    if (op === '>') op = '<'
    else if (op === '>=') op = '<='
    else if (op === '<') op = '>'
    else if (op === '<=') op = '>='
  }
  return 'x ' + op + ' ' + roundResult(solution)
}

// 一元二次不等式 ax^2 + bx + c [运算子] 0
export function solveQuadraticInequality(a, b, c, operator) {
  var roots = solveQuadratic(a, b, c)
  var opensUp = a > 0

  if (!roots) {
    if (operator === '>' || operator === '>=') {
      return opensUp ? '全体实数' : '无解'
    } else {
      return opensUp ? '无解' : '全体实数'
    }
  }

  if (roots.length === 1) {
    var r = roundResult(roots[0])
    if (operator === '>') return opensUp ? ('x ≠ ' + r) : '无解'
    if (operator === '>=') return '全体实数'
    if (operator === '<') return '无解'
    if (operator === '<=') return 'x = ' + r
  }

  roots.sort(function (x, y) { return x - y })
  var r1 = roundResult(roots[0])
  var r2 = roundResult(roots[1])
  var outside = operator === '>' || operator === '>='
  var between = operator === '<' || operator === '<='

  if (opensUp) {
    if (outside) return 'x < ' + r1 + ' 或 x > ' + r2
    if (between) return r1 + ' < x < ' + r2
  } else {
    if (outside) return r1 + ' < x < ' + r2
    if (between) return 'x < ' + r1 + ' 或 x > ' + r2
  }
}

function roundResult(num) {
  var rounded = Math.round(num * 10000) / 10000
  return rounded
}

