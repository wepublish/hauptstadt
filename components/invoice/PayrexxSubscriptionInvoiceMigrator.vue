<script lang="ts">
import Vue, {PropType} from 'vue'
import MemberRegistration from '~/sdk/wep/models/member/MemberRegistration'
import MemberService from '~/sdk/wep/services/MemberService'
import Subscription from '~/sdk/wep/models/subscription/Subscription'
import StripePayment from '~/sdk/wep/components/payment/StripePayment.vue'

export default Vue.extend({
  name: 'PayrexxSubscriptionInvoiceMigrator',
  components: {StripePayment},
  props: {
    subscription: {
      type: Object as PropType<Subscription | undefined>,
      required: true
    }
  },
  data() {
    return {
      intentSecret: undefined as string | undefined,
      errorDialog: false as boolean
    }
  },
  methods: {
    async switchSubscription () {
      if (!this.subscription) {
        this.$nuxt.$emit('alert', {
          title: 'Ein unerwarteter Fehler ist aufgetreten. Die Subscription ist nicht verfügbar.',
          type: 'error'
        })
        return
      }
      
      const memberPlanId = this.subscription.memberPlan?.id
      
      if (!memberPlanId) {
        this.$nuxt.$emit('alert', {
          title: 'Ein unerwarteter Fehler ist aufgetreten. Die Memberplan ID ist nicht verfügbar.',
          type: 'error'
        })
        return
      }
      
      const payrexxPaymentId = this.subscription.memberPlan
        ?.getAvailablePaymentMethods()
        ?.getAvailablePaymentMethodBySlug('payrexx')
        ?.getPaymentMethods()
        ?.getFirstPaymentMethod()
        ?.id
      if (!payrexxPaymentId) {
        this.$nuxt.$emit('alert', {
          title: `Der benötigte Payrexx-Payment-Adapter konnte nicht gefunden werden.`,
          type: 'error'
        })
        return
      }
      
      const memberRegistration = {
        autoRenew: this.subscription.autoRenew,
        monthlyAmount: this.subscription.monthlyAmount,
        memberPlanId,
        paymentPeriodicity: this.subscription.paymentPeriodicity,
        paymentMethodId: payrexxPaymentId,
        successURL: this.$config.PAYMENT_SUCCESS_URL,
        failureURL: this.$config.PAYMENT_FAILURE_URL,
        deactivateSubscriptionId: this.subscription.id
      } as MemberRegistration
      
      const memberService = new MemberService({vue: this})
      const paymentResponse = await memberService.createSubscription({memberRegistration})
      
      const paymentHandling = memberService.handlePaymentResponse({
        response: paymentResponse,
        successURL: this.$config.PAYMENT_SUCCESS_URL,
        issuerMail: this.$config.TECHNICAL_ISSUER_MAIL
      })
      
      if (paymentHandling === 'open-stripe-payment-dialog' && !!paymentResponse) {
        this.intentSecret = paymentResponse.getRedirectUrl()
      } else if (paymentHandling === 'payment-response-is-undefined') {
        this.errorDialog = true
      } else {
        await this.reloadUserData()
      }
    },
    async closeErrorDialog (): Promise<void> {
      this.errorDialog = false
      await this.reloadUserData()
    },
    async reloadUserData (): Promise<void> {
      await this.$store.dispatch('auth/setMeAndFetchAdditionalUserData', { vue: this })
    }
  }
})
</script>

<template>
  <div>
    <v-row v-if="subscription">
      <v-col class="col-12 text-center">
        <v-btn color="primary" @click="switchSubscription()">
          Jetzt bezahlen
        </v-btn>
      </v-col>
    </v-row>
    
    <!-- in case of stripe payment -->
    <v-dialog :value="!!intentSecret" max-width="600px" @click:outside="reloadUserData()"  @close="reloadUserData()">
      <v-card>
        <v-card-title>
          Kreditkartendaten eingeben
        </v-card-title>
        <v-card-text>
          <stripe-payment :intent-secret.sync="intentSecret" />
        </v-card-text>
      </v-card>
    </v-dialog>
    
    <!-- in case deactivation of the payrexx subscription did not work -->
    <v-dialog :value="errorDialog" max-width="600px" @click:outside="reloadUserData()"  @close="reloadUserData()">
      <v-card>
        <v-card-title>
          Etwas ist schief gelaufen
        </v-card-title>
        <v-card-text>
          Weil Du noch über ein altes Abo verfügt hast, haben wir Dir das bisherige Abo automatisch ersetzen.
          Leider hat jedoch die automatische Deaktivierung des veralteten Abos gerade nicht funktioniert.
          Melde Dich doch kurz bei uns unter {{$config.TECHNICAL_ISSUER_MAIL}}
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="closeErrorDialog()">
            Schliessen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>