<script lang="ts">
import Vue, {PropType} from 'vue'
import MemberRegistration from '~/sdk/wep/models/member/MemberRegistration'
import MemberService from '~/sdk/wep/services/MemberService'
import Subscription from '~/sdk/wep/models/subscription/Subscription'

export default Vue.extend({
  name: 'PayrexxSubscriptionInvoiceMigrator',
  props: {
    subscription: {
      type: Object as PropType<Subscription | undefined>,
      required: true
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
      
      await this.$store.dispatch('auth/setMeAndFetchAdditionalUserData', { vue: this })
      
      // trigger invoice to pay
      this.$nuxt.$emit('pay-latest-invoice-of-member-plan-id', memberPlanId)
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
  </div>
</template>