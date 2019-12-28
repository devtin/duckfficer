export class Consumer {
  constructor () {
    this._value = []
  }

  get value () {
    return givenValue => {
      this._value.forEach(fn => {
        givenValue = fn(givenValue)
      })
      return givenValue
    }
  }

  set value (fn) {
    return this._value.push(fn)
  }
}
