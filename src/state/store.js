export class Store {
  constructor(initialState) {
    this.state = initialState
    this.listeners = new Set()
  }

  getState() {
    return this.state
  }

  setState(nextState) {
    this.state = nextState
    this.listeners.forEach((listener) => listener(this.state))
  }

  update(updater) {
    this.setState(updater(this.state))
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

