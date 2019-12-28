Promise.each = async function (arr, cb) {
  for (let i = 0; i < arr.length; i++) {
    await cb(arr[i], i)
  }
}

export class ConsumerAsync {
  constructor () {
    this._value = []
  }

  get value () {
    return async givenValue => {
      await Promise.each(this._value, async fn => {
        givenValue = await fn(givenValue)
      })
      return givenValue
    }
  }

  set value (fn) {
    return this._value.push(fn)
  }
}
