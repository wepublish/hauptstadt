<script lang="ts">
import {defineComponent, PropType} from 'vue'
import CreateMemberPlan from '~/sdk/wep/components/memberPlan/CreateMemberPlan.vue'
import IconsOfPaymentProviders from '~/sdk/wep/models/paymentMethod/IconsOfPaymentProviders'
import IconsOfPaymentProvider from '~/sdk/wep/models/paymentMethod/IconsOfPaymentProvider'
import {RegistrationFormField} from '~/sdk/wep/interfacesAndTypes/Custom'
import MemberPlan from '~/sdk/wep/models/memberPlan/MemberPlan'
import {PropertyValue} from '~/sdk/wep/models/properties/Property'
import WepPublication from '~/sdk/wep/models/wepPublication/WepPublication'

export default defineComponent({
  name: 'CreateMemberPlanView',
  components: {CreateMemberPlan},
  props: {
    memberPlanTags: {
      type: Object as PropType<undefined | PropertyValue[]>,
      required: true,
      default: undefined
    }
  },
  data() {
    return {
      HIDE_PAYMENT_SLIDER_PROP_NAME: 'hide-payment-slider',
      selectedMemberPlan: undefined as undefined | MemberPlan,
      registrationFormFields: [
        {
          name: 'firstName',
          label: 'Vorname',
          rule: 'Bitte gib deinen Vornamen ein.',
          required: true
        },
        {
          name: 'name',
          label: 'Nachname',
          rule: 'Bitte gib deinen Nachnamen ein.',
          required: true
        },
        {
          name: 'streetAddress',
          label: 'Adresse',
          rule: 'Bitte gib deine Adresse ein.',
          required: true,
          cssClass: 'col-12'
        },
        {
          name: 'zipCode',
          label: 'PLZ',
          rule: 'Bitte gib deine Adresse ein.',
          required: true,
          cssClass: 'col-4 col-sm-2'
        },
        {
          name: 'city',
          label: 'Ort',
          rule: 'Bitte gib deinen Ort ein.',
          required: true,
          cssClass: 'col-8 col-sm-5'
        },
        {
          name: 'country',
          label: 'Land',
          rule: 'Bitte Land eingeben.',
          required: true,
          cssClass: 'col-12 col-sm-5'
        },
        {
          name: 'email',
          label: 'E-Mail',
          rule: 'Bitte gib deine E-Mail-Adresse ein.',
          required: true
        },
        {
          name: 'emailRepeat',
          label: 'E-Mail wiederholen',
          required: true
        }
      ] as RegistrationFormField[]
    }
  },
  computed: {
    hidePaymentSlider (): boolean {
      if (!this.selectedMemberPlan) {
        return true
      }
      if (this.selectedMemberPlan.tags?.find(tag => tag === this.HIDE_PAYMENT_SLIDER_PROP_NAME)) {
        return true
      }
      if (this.selectedMemberPlan.amountPerMonthMin === 0) {
        return true
      }
      return false
    },
    iconsOfPaymentProvider (): IconsOfPaymentProviders {
      const iconsOfPaymentProviders = new IconsOfPaymentProviders()
      iconsOfPaymentProviders.iconsOfPaymentProviders.push(
        new IconsOfPaymentProvider({
          paymentProviderSlug: 'stripe',
          iconNames: ['mastercard', 'visa']
        }),
        new IconsOfPaymentProvider({
          paymentProviderSlug: 'payrexx',
          iconNames: ['twint', 'mastercard', 'visa']
        }),
        new IconsOfPaymentProvider({
          paymentProviderSlug: 'payrexx-invoice-only',
          iconNames: ['invoice']
        }),
        new IconsOfPaymentProvider({
          paymentProviderSlug: 'bexio',
          iconNames: ['invoice']
        })
      )
      return iconsOfPaymentProviders
    }
  },
  methods: {
    calcTitleNumber (number: number): number {
      const loggedIn = this.$store.getters['auth/loggedIn']
      let subtract = 0
      if (this.hidePaymentSlider) {
        subtract++
      }
      if (this.selectedMemberPlan?.amountPerMonthMin === 0 && number > 3) {
        subtract++
      }
      if (loggedIn) {
        subtract++
      }
      return number - subtract
    }
  }
})
</script>

<template>
  <create-member-plan
    :icons-of-payment-providers="iconsOfPaymentProvider"
    :registration-form-fields="registrationFormFields"
    :hide-payment-slider="hidePaymentSlider"
    :hide-payment-methods="selectedMemberPlan && selectedMemberPlan.amountPerMonthMin === 0"
    :member-plan-tags="memberPlanTags"
    @changed:memberPlan="(newMemberPlan) => {selectedMemberPlan = newMemberPlan}"
  >
    <template #sliderLabel>
      <span class="font-size-16 abc-bold grey--text text--darken-4">
        Ich zahle für die «Hauptstadt» monatlich
      </span>
    </template>
    <template #selectSubscriptionTitle>
      <span class="headline">1. Abo wählen</span>
    </template>
    <template #selectAmountTitle>
      <span class="headline">2. Betrag wählen</span>
    </template>
    <template #addressTitle>
      <span class="headline">{{ calcTitleNumber(3) }}. Adresse erfassen</span>
    </template>
    <template #selectPaymentMethodTitle>
      <span class="headline">{{ calcTitleNumber(4) }}. Zahlungsmethode wählen</span>
    </template>
    <template #spamTitle>
      <span class="headline">{{ calcTitleNumber(5) }}. Spam-Schutz</span>
    </template>
  </create-member-plan>
</template>