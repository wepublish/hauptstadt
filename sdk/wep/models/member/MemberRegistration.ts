import Member from '~/sdk/wep/models/member/Member'
import {PaymentPeriodicity} from '~/sdk/wep/models/paymentMethod/AvailablePaymentMethod'
import Address from '~/sdk/wep/models/user/Address'
import ChallengeAnswer from '~/sdk/wep/models/challenge/ChallengeAnswer'

export interface MemberRegistrationProps {
  id?: string
  name?: string
  firstName?: string
  preferredName?: string
  address?: Address
  email?: string
  memberPlanId?: string
  autoRenew?: boolean
  paymentPeriodicity?: PaymentPeriodicity
  monthlyAmount?: number
  paymentMethodId?: string
  successURL?: string
  failureURL?: string
  challengeAnswer?: ChallengeAnswer
  password?: string
  deactivateSubscriptionId?: string
}

/**
 * Represents object to be saved by the registerMemberAndReceivePayment endpoint of WePublish
 */
export default class MemberRegistration extends Member {
  public memberPlanId?: string
  public autoRenew?: boolean
  public paymentPeriodicity?: PaymentPeriodicity
  public monthlyAmount?: number
  public paymentMethodId?: string
  public successURL?: string
  public failureURL?: string
  public challengeAnswer?: ChallengeAnswer
  public password?: string
  public deactivateSubscriptionId?: string

  constructor({
    id,
    name,
    firstName,
    preferredName,
    address,
    email,
    memberPlanId,
    autoRenew,
    paymentPeriodicity,
    monthlyAmount,
    paymentMethodId,
    successURL,
    failureURL,
    challengeAnswer,
    password,
    deactivateSubscriptionId
  }: MemberRegistrationProps) {
    super({id, name, firstName, preferredName, address, email})
    this.memberPlanId = memberPlanId
    this.autoRenew = autoRenew
    this.paymentPeriodicity = paymentPeriodicity
    this.monthlyAmount = monthlyAmount
    this.paymentMethodId = paymentMethodId
    this.successURL = successURL
    this.failureURL = failureURL
    this.challengeAnswer = challengeAnswer ? new ChallengeAnswer(challengeAnswer) : undefined
    this.password = password
    this.deactivateSubscriptionId = deactivateSubscriptionId
  }

  getUser() {
    return super.getThis()
  }
}
