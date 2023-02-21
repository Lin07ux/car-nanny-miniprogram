export const formatTime = (date?: Date, connector: string = ':'): string => {
  date = date || new Date

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [hour, minute, second].map(formatNumber).join(connector)
}

export const formatDate = (date?: Date, connector: string = '-'): string => {
  date = date || new Date

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join(connector)
}

export const formatDateTime = (date?: Date, connector: string = ' '): string => {
  return formatDate(date) + connector + formatTime(date)
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}
