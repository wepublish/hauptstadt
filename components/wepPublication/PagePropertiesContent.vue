<template>
  <v-row
    v-if="publication"
    class="justify-center"
  >
    <!-- eventually show member ship -->
    <v-col
      v-if="propertyType === 'create-member-plan'"
      class="col-12 max-width-840 px-sm-0 pt-0"
    >
      <create-member-plan-view :member-plan-tags="memberPlanTags" />
    </v-col>

    <!-- eventually show login -->
    <v-col
      v-if="propertyType === 'login'"
      class="col-12 max-width-680 px-sm-0"
    >
      <login-form
        :redirect-path-on-login-success="redirectPathAfterLogin"
        allow-focus-input
        hide-registration
      />
    </v-col>

    <!-- eventually show user profile -->
    <v-col
      v-if="propertyType === 'profile'"
      class="col-12 px-sm-0"
    >
      <AuthenticationAuthenticatedComponent>
        <hs-profile />
      </AuthenticationAuthenticatedComponent>
    </v-col>

    <!-- eventually show deactivated abos -->
    <v-col
      v-if="propertyType === 'deactivated-abos'"
      class="col-12 max-width-680 px-sm-0"
    >
      <AuthenticationAuthenticatedComponent>
        <deactivated-subscriptions />
      </AuthenticationAuthenticatedComponent>
    </v-col>

    <!-- eventually show abo details -->
    <v-col
      v-if="propertyType === 'abo-details'"
      class="col-12 max-width-680 px-sm-0"
    >
      <AuthenticationAuthenticatedComponent>
        <user-subscription-view
          :id="$route.query.subscriptionId"
        />
      </AuthenticationAuthenticatedComponent>
    </v-col>

    <!-- eventually show open invoice -->
    <v-col
      v-if="propertyType === 'open-invoice'"
      class="col-12 max-width-680 px-sm-0"
    >
      <AuthenticationAuthenticatedComponent>
        <open-invoice
          :invoice-id="$route.query.invoiceId"
        />
      </AuthenticationAuthenticatedComponent>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { PropertyValue } from '~/sdk/wep/models/properties/Property'
import WepPublication from '~/sdk/wep/models/wepPublication/WepPublication'
import CreateMemberPlan from '~/sdk/wep/components/memberPlan/CreateMemberPlan.vue'
import LoginForm from '~/sdk/wep/components/authentication/LoginForm.vue'
import HsProfile from '~/components/profile/HsProfile.vue'
import DeactivatedSubscriptions from '~/sdk/wep/components/subscription/DeactivatedSubscriptions.vue'
import UserSubscriptionView from '~/sdk/wep/components/subscription/UserSubscriptionView.vue'
import OpenInvoice from '~/sdk/wep/components/invoice/OpenInvoice.vue'
import CreateMemberPlanView from '~/sdk/wep/components/memberPlan/CreateMemberPlanView.vue'

export default Vue.extend({
  name: 'PagePropertiesContent',
  components: {CreateMemberPlanView, OpenInvoice, UserSubscriptionView, DeactivatedSubscriptions, HsProfile, LoginForm, CreateMemberPlan },
  props: {
    publication: {
      type: Object as PropType<undefined | WepPublication>,
      required: true,
      default: undefined
    }
  },
  data () {
    return {
      // custom properties
      memberPlanTypeProperty: undefined as undefined | PropertyValue
    }
  },
  computed: {
    propertyType (): undefined | PropertyValue {
      return this.publication?.properties?.findPropertyByKey('type')?.value
    },
    redirectPathAfterLogin (): string {
      // open invoice link (from mail)
      const invoiceId = this.$route.query.invoiceId
      const openInvoicePath = this.$config.OPEN_INVOICE_PATH
      if (!!invoiceId && typeof invoiceId === 'string' && openInvoicePath) {
        return openInvoicePath.replace(':invoiceId', invoiceId)
      }
      const redirectPathOnLoginSuccess = this.$route.query?.redirectPathOnLoginSuccess
      if (redirectPathOnLoginSuccess && typeof redirectPathOnLoginSuccess === 'string') {
        return redirectPathOnLoginSuccess
      }
      return '/'
    },
    memberPlanTags (): undefined | PropertyValue[] {
      const memberPlanTag = this.publication?.properties?.findPropertyByKey('member-plan-tag')?.value
      return memberPlanTag ? [memberPlanTag] : undefined
    }
  }
})
</script>
