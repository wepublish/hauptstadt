import Subscription from '~/sdk/wep/models/subscription/Subscription'

export default class Subscriptions {
  public subscriptions: Subscription[]

  constructor() {
    this.subscriptions = []
  }

  parse(subscriptions: Subscription[]) {
    this.subscriptions = []
    for (const subscription of subscriptions) {
      this.subscriptions.push(new Subscription(subscription))
    }
    this.sortById()
    return this
  }

  private sortById(): void {
    this.subscriptions.sort((a, b) => {
      if (a.id < b.id) {
        return -1
      }
      if (a.id > b.id) {
        return 1
      }
      return 0
    })
  }

  public getSubscriptionById(id: string) {
    return this.subscriptions.find(subscription => subscription.id === id)
  }

  public getActiveAndNonTrialSubscription (): Subscription | undefined {
    return this.subscriptions.find(subscription => !subscription.deactivation && !subscription.isTrialSubscription())
  }

  public getTrialSubscription (): Subscription | undefined {
    return this.subscriptions.find(subscription => subscription.isTrialSubscription())
  }

  public hasValidSubscription(): boolean {
    return !!this.subscriptions.find(subscription => subscription.isValid())
  }
}
