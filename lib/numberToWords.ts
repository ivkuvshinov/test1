const units = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
const unitsF = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']
const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']

interface ScaleWord {
  one: string
  two: string
  five: string
  feminine: boolean
}

const scales: ScaleWord[] = [
  { one: '', two: '', five: '', feminine: false },
  { one: 'тысяча', two: 'тысячи', five: 'тысяч', feminine: true },
  { one: 'миллион', two: 'миллиона', five: 'миллионов', feminine: false },
  { one: 'миллиард', two: 'миллиарда', five: 'миллиардов', feminine: false },
  { one: 'триллион', two: 'триллиона', five: 'триллионов', feminine: false },
]

const rubleWords = { one: 'рубль', two: 'рубля', five: 'рублей' }
const kopeckWords = { one: 'копейка', two: 'копейки', five: 'копеек' }

function getPlural(n: number, words: { one: string; two: string; five: string }): string {
  const lastTwo = Math.abs(n) % 100
  const lastOne = lastTwo % 10
  
  if (lastTwo >= 11 && lastTwo <= 19) {
    return words.five
  }
  if (lastOne === 1) {
    return words.one
  }
  if (lastOne >= 2 && lastOne <= 4) {
    return words.two
  }
  return words.five
}

function convertHundreds(n: number, feminine: boolean): string {
  const result: string[] = []
  
  const h = Math.floor(n / 100)
  const remainder = n % 100
  const t = Math.floor(remainder / 10)
  const u = remainder % 10
  
  if (h > 0) {
    result.push(hundreds[h])
  }
  
  if (remainder >= 10 && remainder < 20) {
    result.push(teens[remainder - 10])
  } else {
    if (t > 0) {
      result.push(tens[t])
    }
    if (u > 0) {
      result.push(feminine ? unitsF[u] : units[u])
    }
  }
  
  return result.join(' ')
}

function integerToWords(n: number): string {
  if (n === 0) {
    return 'ноль'
  }
  
  const result: string[] = []
  let scaleIndex = 0
  let remaining = Math.floor(n)
  
  while (remaining > 0) {
    const chunk = remaining % 1000
    remaining = Math.floor(remaining / 1000)
    
    if (chunk > 0) {
      const scale = scales[scaleIndex]
      const words = convertHundreds(chunk, scale.feminine)
      
      if (scaleIndex > 0) {
        const scaleWord = getPlural(chunk, scale)
        result.unshift(`${words} ${scaleWord}`)
      } else {
        result.unshift(words)
      }
    }
    
    scaleIndex++
  }
  
  return result.join(' ')
}

export function numberToWords(amount: number): string {
  const rubles = Math.floor(amount)
  const kopecks = Math.round((amount - rubles) * 100)
  
  const rublesWord = getPlural(rubles, rubleWords)
  const kopecksWord = getPlural(kopecks, kopeckWords)
  
  const rublesText = integerToWords(rubles)
  
  let kopecksText: string
  if (kopecks === 0) {
    kopecksText = 'ноль'
  } else if (kopecks < 10) {
    kopecksText = unitsF[kopecks] || 'ноль'
  } else if (kopecks < 20) {
    kopecksText = teens[kopecks - 10]
  } else {
    const t = Math.floor(kopecks / 10)
    const u = kopecks % 10
    kopecksText = u > 0 ? `${tens[t]} ${unitsF[u]}` : tens[t]
  }
  
  return `${rublesText} ${rublesWord} ${String(kopecks).padStart(2, '0')} ${kopecksWord}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}