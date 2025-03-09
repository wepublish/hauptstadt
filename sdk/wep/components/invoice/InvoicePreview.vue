<template>
  <v-card outlined>
    <v-card-title>
      <v-row class="no-gutters flex-nowrap align-center" style="max-width: 100%;">
        <v-col
          class="col- 10 word-break-keep-all"
        >
          <span v-if="!invoice.isPaid()">Offene&nbsp;</span> Zahlung <span v-if="subscription">&nbsp;für {{ subscription.memberPlan.name }}</span>
        </v-col>
        <!-- open invoice hint -->
        <v-col
          class="col-2 text-right font-size-36"
        >
          <span
            v-if="invoice.isPaid()"
            class="fas fa-check green--text"
          />
          <span
            v-else-if="!invoice.isPaid() && invoice.canceledAt"
            class="fal fa-align-slash primary--text"
          />
          <span
            v-else-if="willBeAutoCharged"
            class="fal fa-sync primary--text"
          />
          <span
            v-else
            class="fas fa-exclamation-triangle error--text"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="mt-3">
      <v-row dense>
        <v-col class="col-12">
          Rechnungs-Nr.: {{ invoice.id }}
        </v-col>
        <v-col class="col-12">
          {{ invoice.description }}
        </v-col>
        <v-col class="col-12">
          E-Mail: {{ invoice.mail }}
        </v-col>
        <v-col class="col-12">
          Betrag: {{ NumberHelper.roundChf(invoice.total) }} chf
        </v-col>
        <v-col class="col-12">
          Bezahlt:
          <!-- paid -->
          <span v-if="invoice.isPaid()">
            {{ invoice.paidAt.format('DD.MM.YYYY') }}
            <span class="fal fa-check" />
          </span>

          <!-- not paid -->
          <span v-else>
            <!-- check payment state -->
            <span v-if="checkInvoiceStates">
              <span class="fal fa-circle-notch fa-spin" />
              Prüfe Status
            </span>
            <span v-else class="fal fa-times" />
          </span>
        </v-col>
        <v-col
          v-if="!!invoice.canceledAt"
          class="col-12 font-weight-bold"
        >
          Rechnung storniert am {{ invoice.canceledAt.format('DD.MM.YYYY') }}
        </v-col>
        <!-- invoice can be paid by payrexx invoice only -->
        <v-col
          v-if="isInvoiceOnly"
          class="col-12"
        >
          <v-alert type="info" color="primary">
            Du erhältst eine PDF-Rechnung per E-Mail zugeschickt.
          </v-alert>
        </v-col>
        <!-- invoice will be charged automatically -->
        <v-col
          v-if="willBeAutoCharged"
          class="col-12"
        >
          <v-alert type="info" color="primary">
            Deine Kreditkarte wird automatisch belastet.
          </v-alert>
        </v-col>
      </v-row>
    </v-card-text>
    <!-- payrexx subscription workaround -->
    <v-card-actions v-if="isPayrexxSubscription && !invoice.isPaid()">
      <v-row>
        <v-col class="col-12">
          <payrexx-subscription-invoice-migrator :subscription="subscription" />
        </v-col>
      </v-row>
    </v-card-actions>
    <v-card-actions v-else-if="!invoice.isPaid() && !invoice.canceledAt && !isInvoiceOnly && !willBeAutoCharged && !isPayrexxSubscription">
      <v-row class="justify-center">
        <v-col class="col-auto">
          <payment-btn-and-handler
            mode="payOpenInvoice"
            :subscription="subscription"
            :invoice="invoice"
            :loading="checkInvoiceStates"
            :disabled="!paymentPossible"
          />
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Invoice from '~/sdk/wep/models/invoice/Invoice'
import Subscriptions from '~/sdk/wep/models/subscription/Subscriptions'
import NumberHelper from '~/sdk/wep/classes/NumberHelper'
import Subscription from '~/sdk/wep/models/subscription/Subscription'
import PaymentBtnAndHandler from '~/sdk/wep/components/payment/PaymentBtnAndHandler.vue'
import {isInvoiceOnly} from '~/sdk/wep/classes/InvoiceOnlyHelper'
import PayrexxSubscriptionInvoiceMigrator from '~/components/invoice/PayrexxSubscriptionInvoiceMigrator.vue'

export default Vue.extend({
  name: 'InvoicePreview',
  components: {PayrexxSubscriptionInvoiceMigrator, PaymentBtnAndHandler },
  props: {
    invoice: {
      type: Object as PropType<Invoice>,
      required: true
    },
    subscriptions: {
      type: Object as PropType<Subscriptions>,
      required: true
    },
    checkInvoiceStates: {
      type: Boolean as PropType<Boolean>,
      required: true
    }
  },
  data () {
    return {
      NumberHelper
    }
  },
  computed: {
    isPayrexxSubscription (): boolean {
      return this.subscription?.paymentMethod?.getSlug() === this.$config.PAYREXX_SUBSCRIPTION_SLUG
    },
    subscription (): undefined | Subscription {
      if (!this.subscriptions) {
        return undefined
      }
      return this.subscriptions?.getSubscriptionById(this.invoice.subscriptionID)
    },
    paymentPossible (): boolean {
      // invoice has been cancelled
      if (this.invoice.canceledAt) {
        return false
      }
      return !this.checkInvoiceStates;
    },
    // checks for payrexx only invoice and bexio subscriptions
    isInvoiceOnly (): boolean {
      return isInvoiceOnly({
        invoice: this.invoice,
        subscription: this.subscription,
        payrexxInvoiceOnlySlug: this.$config.PAYREXX_INVOICE_ONLY_SLUG
      })
    },
    willBeAutoCharged (): boolean {
      if (this.invoice.isPaid()) {
        return false
      }
      return !!this.subscription?.willBeAutoCharged(this.$config.AUTO_CHARGE_PAYMENT_METHOD_SLUGS)
    }
  }
})
</script>
