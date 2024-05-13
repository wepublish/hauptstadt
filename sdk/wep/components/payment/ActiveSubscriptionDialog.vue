<template>
  <v-dialog
    :value="value"
    scrollable
    max-width="550"
    persistent
    @input="value => $emit('update:value', value)"
  >
    <v-card>
      <v-card-title>
        Du hast noch ein aktives "{{memberPlanName}}"
      </v-card-title>
      <v-card-subtitle>
        Willst du ein zusätzliches Abo lösen?
      </v-card-subtitle>
      <v-card-actions>
        <v-row
          class="justify-space-between row--dense"
        >
          <v-col class="col-12 col-md-auto text-center order-1 order-md-0">
            <back-to-btn outlined>
              Zurück zum Profil
            </back-to-btn>
          </v-col>
          <v-col class="col-12 col-md-auto text-center order-0 order-md-1">
            <v-btn
              color="primary"
              elevation="0"
              @click="$emit('checkout')"
            >
              Ja, Abo lösen
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue'
import BackToBtn from '~/sdk/wep/components/helpers/BackToBtn.vue'
import Subscription from '~/sdk/wep/models/subscription/Subscription'

export default Vue.extend({
  name: 'ActiveSubscriptionDialog',
  components: { BackToBtn },
  props: {
    value: {
      type: Boolean as PropType<boolean>,
      required: true,
      default: false
    },
    activeSubscription: {
      type: Object as PropType<Subscription | undefined>,
      required: true,
      default: undefined
    }
  },
  computed: {
    memberPlanName () : string | undefined {
      return this.activeSubscription?.memberPlan?.name
    }
  }
})
</script>
