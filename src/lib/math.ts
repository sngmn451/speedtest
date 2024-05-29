export function percentile(arr: any[], q: number){
  let a = arr.slice()
  // Turn q into a decimal (e.g. 95 becomes 0.95)
  q = q/100

  // Sort the array into ascending order
  let data = arr.sort((a, b) => a - b)

  // Work out the position in the array of the percentile point
  let p = ((data.length) - 1) * q
  let b = Math.floor(p)

  // Work out what we rounded off (if anything)
  let remainder = p - b

  // See whether that data exists directly
  if (data[b+1] !== undefined){
    return parseFloat(data[b]) + remainder * (parseFloat(data[b+1]) - parseFloat(data[b]))
  } else {
    return parseFloat(data[b])
  }
}
