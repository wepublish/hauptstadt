<template>
  <div>
    <!-- just add another btn with another mode, to extend this component -->
    <v-btn :outlined="btnDisabled" :color="btnDisabled ? 'black' : 'primary'" :disabled="btnDisabled"
      :loading="preparingPayment || loading" elevation="0" @click="initPay()">
      <span v-if="loading">
        <span class="mdi mdi-spin mdi-loading" />
        Prüfe Status
      </span>

      <!-- Payrexx Subscription workaround -->
      <span v-else-if="autoPayrexxPayment">
        <!-- extend subscription -->
        <span v-if="mode === 'extendSubscription'">
          Auto-Verlängerung
        </span>

        <!-- open invoice -->
        <span v-if="mode === 'payOpenInvoice'">
          Zahlung automatisch via Payrexx
        </span>
      </span>

      <!-- payment possible -->
      <span v-else>
        <!-- extend subscription -->
        <span v-if="mode === 'extendSubscription'">
          <span v-if="isTrialSubscription">
            Reguläres Abo lösen
          </span>
          <span v-else>
            <span class="fal fa-plus mr-1" />
            Abo verlängern
          </span>
        </span>

        <!-- pay open invoice -->
        <span v-if="mode === 'payOpenInvoice'">
          Jetzt bezahlen
        </span>
      </span>
    </v-btn>

    <!-- extend subscription dialog -->
    <v-dialog v-model="extendDialog" max-width="600px">
      <v-card>
        <v-card-title>
          Abo um ein {{ subscription.getPaymentPeriodicityReadable(true) }} verlängern?
        </v-card-title>
        <v-card-text>
          Wir freuen uns, dass du dein Abo frühzeitig um ein {{ subscription.getPaymentPeriodicityReadable(true) }}
          verlängern willst.
        </v-card-text>
        <v-card-actions class="justify-space-around">
          <v-btn outlined @click="extendDialog = false">
            Abbrechen
          </v-btn>
          <v-btn color="primary" @click="userWantToExtendSubscription()">
            Jetzt verlängern
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- payrexx migration dialog -->
    <v-dialog v-model="payrexxMigrationDialog" @click:outside="pay()" max-width="550px">
      <v-card>
        <v-btn icon large style="top: 0; right: 0; position: absolute;" @click="pay()">
          <span class="fal fa-times fa-2x" />
        </v-btn>
        <v-card-title>
          Künftig noch einfacher: Automatische Bezahlung
        </v-card-title>
        <v-card-text>
          <p>
            Wir haben den Twint-Zahlungsprozess für dich vereinfacht. Sofern du uns dein Einverständnis gibst, wird dein
            Abo in Zukunft automatisch verlängert. Selbstverständlich werden wir dich vor jeder Abbuchung transparent
            und rechtzeitig per Mail daran erinnern. Du kannst das Abo auch jederzeit kündigen.
          </p>
          <p>
            Wenn du damit nicht einverstanden bist, senden wir dir künftig eine QR-Rechnung per E-Mail, die du hernach
            begleichen kannst.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-row class="justify-space-around text-center align-center mb-1">
            <v-col class="v-col-auto order-1 order-sm-0">
              <v-btn small outlined color="grey" @click="openSwitchDialog()">
                Nein, auf Rechnung wechseln
              </v-btn>
            </v-col>
            <v-col class="v-col-auto order-0 order-sm-1">
              <v-btn large color="primary" @click="pay()">
                <span class="fal fa-check mr-1" />
                Einverstanden
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- really want to change to invoice -->
    <v-dialog v-model="switchToInvoiceDialog" max-width="550px">
      <v-card>
        <v-card-title>
          Bist du sicher?
        </v-card-title>
        <v-card-text>
          Dein aktuelles Abo wird gekündet und ein neues wird auf Rechnung erstellt.
        </v-card-text>
        <v-card-actions class="justify-space-around">
          <v-btn outlined @click="switchSubscription()">
            Ja, Abo wechseln
          </v-btn>
          <v-btn color="primary" @click="pay()">
            Doch lieber online bezahlen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- stripe payment dialog -->
    <v-dialog v-model="paymentDialog" transition="dialog-bottom-transition" max-width="600px">
      <v-card v-if="intentSecret">
        <v-card-title>
          <v-row class="no-gutters justify-space-between">
            <v-col class="col-auto">
              Bitte gib deine Kreditkarten-Daten ein
            </v-col>
            <v-col class="col-auto">
              <v-btn icon @click="paymentDialog = false">
                <span class="mdi mdi-window-close headline" />
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <stripe-payment :intent-secret="intentSecret" />
        </v-card-text>
      </v-card>
      <v-card v-else>
        <v-card-title>
          Einen kurzen Moment bitte
        </v-card-title>
        <v-card-text class="text-center pt-6">
          <span class="fal fa-circle-notch fa-spin" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
/**
 * This component provides a simple btn and handles simple payments from existing subscriptions or invoices.
 * Either to extend a payment or to pay an open invoice.
 */
import Vue, { PropType } from 'vue'
import StripePayment from '~/sdk/wep/components/payment/StripePayment.vue'
import InvoiceService from '~/sdk/wep/services/InvoiceService'
import Subscription from '~/sdk/wep/models/subscription/Subscription'
import Invoice from '~/sdk/wep/models/invoice/Invoice'
import PaymentResponse from '~/sdk/wep/models/response/PaymentResponse'
import User from '~/sdk/wep/models/user/User'
import Invoices from '~/sdk/wep/models/invoice/Invoices'
import SubscriptionService from '~/sdk/wep/services/SubscriptionService'
import MemberService from '~/sdk/wep/services/MemberService'
import MemberRegistration from '~/sdk/wep/models/member/MemberRegistration'
import {PropertyValue} from '~/sdk/wep/models/properties/Property'

export default Vue.extend({
  name: 'PaymentBtnAndHandler',
  components: { StripePayment },
  props: {
    mode: {
      type: String as PropType<'payOpenInvoice' | 'extendSubscription'>,
      required: true
    },
    subscription: {
      type: Object as PropType<Subscription>,
      required: true
    },
    // invoice only needed in mode "payOpenInvoice"
    invoice: {
      type: Object as PropType<undefined | Invoice>,
      required: false,
      default: undefined
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false
    },
    loading: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false
    }
  },
  data () {
    return {
      intentSecret: undefined as undefined | string,
      preparingPayment: false as boolean,
      paymentDialog: false as boolean,
      extendDialog: false as boolean,
      payrexxMigrationDialog: false as boolean,
      switchToInvoiceDialog: false as boolean
    }
  },
  computed: {
    // checks workaround Payrexx subscription as described here: https://wepublish.atlassian.net/browse/BAJ-473
    autoPayrexxPayment (): boolean {
      if (!this.subscription) {
        return true
      }
      const paymentMethodSlug = this.subscription.getPaymentMethod()?.getSlug()
      if (paymentMethodSlug === this.$config.PAYREXX_SUBSCRIPTION_SLUG) {
        return true
      }
      return false
    },
    autoChargingPayment (): boolean {
      const slugs: string[] = this.$config.AUTO_CHARGE_PAYMENT_METHOD_SLUGS
      return !!this.subscription?.willBeAutoCharged(slugs)
    },
    me (): undefined | User {
      return this.$store.getters['auth/me']
    },
    invoices (): undefined | Invoices {
      return this.me?.invoices
    },
    subscriptionHasOpenInvoice (): boolean {
      if (!this.invoices) {
        return false
      }
      return !!this.invoices.getOpenInvoicesBySubscriptionId(this.subscription.id).length
    },
    btnDisabled (): boolean {
      return this.disabled || this.autoPayrexxPayment || this.autoChargingPayment
    },
    isTrialSubscription (): boolean {
      return this.subscription.isTrialSubscription()
    }
  },
  watch: {
    autoPayrexxPayment: {
      immediate: true,
      handler () {
        this.$emit('setAutoPayrexxPayment', this.autoPayrexxPayment)
      }
    }
  },
  methods: {
    closeDialogs (): void {
      this.extendDialog = false
      this.paymentDialog = false
      this.payrexxMigrationDialog = false
      this.switchToInvoiceDialog = false
    },

    // Init invoice payment
    initPay (): void {
      if (this.mode === 'payOpenInvoice') {
        if (this.openPayrexxDialoge()) {
          this.payrexxMigrationDialog = true
          return
        }
        // directly go to payment
        this.pay()
      } else if (this.mode === 'extendSubscription') {
        if (this.isTrialSubscription) {
          this.$router.push('/abo')
        } else {
          // open confirm dialog
          this.extendDialog = true
        }
      }
    },
    
    // deprecated after 01.05.2024
    userWantToExtendSubscription (): void {
      if (this.openPayrexxDialoge()) {
        this.closeDialogs()
        this.payrexxMigrationDialog = true
      } else {
        this.pay()
      }
    },

    /**
     * @return {Promise<boolean>}
     */
    async pay (): Promise<void | false> {
      this.closeDialogs()
      this.preparingPayment = true
      // do some checks
      const checkResult = this.checksBeforePayment()
      if (!checkResult) {
        this.preparingPayment = false
        return
      }

      let response
      if (this.mode === 'payOpenInvoice') {
        response = await new InvoiceService({ vue: this }).createPaymentFromInvoiceInput({
          invoiceID: this.invoice!.id,
          ...checkResult
        })
      } else if (this.mode === 'extendSubscription') {
        response = await new SubscriptionService({ vue: this }).extendSubscription({
          subscriptionId: this.subscription.id,
          successURL: checkResult.successURL,
          failureURL: checkResult.failureURL
        })
      }

      await this.handlingAfterPayment(response)
      this.preparingPayment = false
    },
    
    openPayrexxDialoge (): boolean {
      // auto deactivate function after April 2025
      const stopFunction = new Date(2025, 4, 1)
      const now = new Date()
      if (now.getTime() >= stopFunction.getTime()) {
        return false
      }
      const paymentMethodSlug = this.subscription.getPaymentMethod()?.getSlug()
      return paymentMethodSlug === 'payrexx'
    },
    
    openSwitchDialog (): void {
      this.closeDialogs()
      this.switchToInvoiceDialog = true
    },
    
    checksBeforePayment (): false | {paymentMethodID: string, successURL: string, failureURL: string} {
      // do not extend subscription if it has unpaid invoices
      if (this.mode === 'extendSubscription' && this.subscriptionHasOpenInvoice) {
        this.$nuxt.$emit('alert', {
          title: 'Das Abo kann nicht verlängert werden, weil noch offene Rechnungen bestehen. Bitte zahle diese zuerst.',
          type: 'error'
        })
        return false
      }

      // do not try to pay Payrexx Subscriptions
      if (this.autoPayrexxPayment) {
        this.$nuxt.$emit('alert', {
          title: `Zahlung nicht möglich. Sie erfolgt automatisch via Payrexx. Bitte wende Dich an ${this.$config.TECHNICAL_ISSUER_MAIL}`,
          type: 'error'
        })
        return false
      }

      // check invoice is available, if mode is payOpenInvoice
      if (this.mode === 'payOpenInvoice' && !this.invoice) {
        this.$nuxt.$emit('alert', {
          title: `Unerwarteter Fehler: invoice fehlt. Bitte wende Dich an ${this.$config.TECHNICAL_ISSUER_MAIL}`,
          type: 'error'
        })
        return false
      }

      // get payment id out of subscriptions
      if (!this.subscription) {
        this.$nuxt.$emit('alert', {
          title: `Das Abo konnte nicht gefunden werden. Bitte wende Dich an ${this.$config.TECHNICAL_ISSUER_MAIL}`,
          type: 'error'
        })
        return false
      }
      const paymentMethodID = this.subscription.getPaymentMethod()?.getId()
      if (!paymentMethodID) {
        this.$nuxt.$emit('alert', {
          title: `Leider wurde die Zahlungs-ID nicht gefunden. Bitte wende Dich an ${this.$config.TECHNICAL_ISSUER_MAIL}`,
          type: 'error'
        })
        return false
      }

      const successURL = this.$config.PAYMENT_SUCCESS_URL
      const failureURL = this.$config.PAYMENT_FAILURE_URL
      if (!successURL || !failureURL) {
        this.$nuxt.$emit('alert', {
          title: `Eine Weiterleitungs-Url fehlt. Bitte wende Dich an ${this.$config.TECHNICAL_ISSUER_MAIL}`,
          type: 'error'
        })
        return false
      }
      return {
        paymentMethodID,
        successURL,
        failureURL
      }
    },
    async handlingAfterPayment (response: false | PaymentResponse): Promise<boolean | void> {
      if (!response) {
        // refresh user data, in case of error
        await this.refreshUserData()
        return false
      }

      // abo has been paid with existing credit card
      if (response.state === 'Paid') {
        this.$nuxt.$emit('alert', {
          title: 'Abo wurde erfolgreich verlängert und bezahlt.',
          type: 'success'
        })
        await this.refreshUserData()
        return true
      }

      const redirectUrl = response.getRedirectUrl()

      // no redirect url available
      if (!redirectUrl) {
        this.$nuxt.$emit('alert', {
          title: `Leider fehlt die Weiterleitungs-URL. Bitte wende dich an ${this.$config.TECHNICAL_ISSUER_MAIL}`,
          type: 'error'
        })
        await this.refreshUserData()
        return false
      }
      // payrexx
      if (redirectUrl.startsWith('https://')) {
        this.preparingPayment = false
        window.location.assign(redirectUrl)
      } else if (redirectUrl.startsWith('no_charge')) { // trial subscriptions: non-charge-payment-adapter
        const successURL = this.$config.PAYMENT_SUCCESS_URL
        window.location.assign(successURL)
      } else { // stripe
        // open payment dialog
        this.intentSecret = redirectUrl
        this.$nextTick(() => {
          this.paymentDialog = true
        })
      }
    },

    // deprecated from 01.05.2024 on
    async switchSubscription () {
      this.preparingPayment = true
      this.closeDialogs()
      // 1. do some checks
      const checkResult = this.checksBeforePayment()
      if (!checkResult) {
        this.preparingPayment = false
        return
      }
      
      // 2. get bexio payment adapter id
      const bexioPaymentId = this.subscription.memberPlan
        ?.getAvailablePaymentMethods()
        ?.getAvailablePaymentMethodBySlug('bexio')
        ?.getPaymentMethods()
        ?.getFirstPaymentMethod()
        ?.id
      if (!bexioPaymentId) {
        this.$nuxt.$emit('alert', {
          title: `Der benötigte Bexio-Payment-Adapter konnte nicht gefunden werden.`,
          type: 'error'
        })
        this.preparingPayment = false
        return
      }
      
      // 3. create new subscription
      const memberRegistration = {
        autoRenew: this.subscription.autoRenew,
        monthlyAmount: this.subscription.monthlyAmount,
        memberPlanId: this.subscription.memberPlan?.id,
        paymentPeriodicity: this.subscription.paymentPeriodicity,
        paymentMethodId: bexioPaymentId,
        successURL: this.$config.PAYMENT_SUCCESS_URL,
        failureURL: this.$config.PAYMENT_FAILURE_URL,
        deactivateSubscriptionId: this.subscription.id
      } as MemberRegistration
      const memberService = new MemberService({vue: this})
      const paymentResponse = await memberService.createSubscription({memberRegistration})
      
      if (!paymentResponse) {
        this.preparingPayment = false
        return false
      }
      
      // 4. reload user subscriptions
      await this.refreshUserData()
    },

    async refreshUserData () {
      await this.$store.dispatch('auth/setMeAndFetchAdditionalUserData', { vue: this })
    }
  }
})
</script>
