<script lang="ts">
import Vue from 'vue'
import VueTurnstile from '@gaviti/vue-turnstile'
import ChallengeService from '~/sdk/wep/services/ChallengeService'
import Challenge from '~/sdk/wep/models/challenge/Challenge'
import ChallengeAnswer from '~/sdk/wep/models/challenge/ChallengeAnswer'

export default Vue.extend({
  name: 'TurnstileView',
  components: {
    VueTurnstile
  },
  data() {
    return {
      challenge: undefined as (Challenge | false | undefined),
      token: undefined as string | undefined
    }
  },
  mounted() {
    this.initChallenge()
  },
  computed: {
    challengeId(): string | undefined {
      return this.challenge ? this.challenge?.challengeID : undefined
    },
    challengeAnswer(): ChallengeAnswer | undefined {
      if (!this.token || !this.challengeId) { return undefined }
      return new ChallengeAnswer({
        challengeID: this.challengeId,
        challengeSolution: this.token
      })
    },
    turnStileSiteKey(): string | undefined {
      return this.$config.CF_TURNSTILE_SITE_KEY
    }
  },
  watch: {
    challengeAnswer: {
      handler() {
        console.log('emit')
        this.$emit('challengeAnswer', this.challengeAnswer)
      },
      deep: true
    }
  },
  methods: {
    async initChallenge() {
      const challengeService = new ChallengeService({ vue: this })
      this.challenge = await challengeService.getChallenge()
    },
    async reset() {
      this.challenge = undefined
      this.token = undefined
      this.initChallenge()
    }
  }
})
</script>

<template>
  <v-row>
    <v-col v-if="!turnStileSiteKey">
      <v-alert type="error" outlined>Fehlende Konfiguration des Cloudflare-Turnstile-Spamschutzes. Bitte wende Dich an
        {{ $config.TECHNICAL_ISSUER_MAIL }}</v-alert>
    </v-col>
    <v-col v-else-if="!challengeAnswer">
      <vue-turnstile @verified="token = $event" :site-key="$config.CF_TURNSTILE_SITE_KEY" appearance="always" />
    </v-col>
    <v-col v-else>
      <span class="fa fa-shield-check green--text mr-1" /> Erfüllt
    </v-col>

    <!-- challenge service error -->
    <v-col v-if="challenge === false">
      <v-alert type="error" outlined>Beim Spam-Schutz ist ein Fehler aufgetreten. Bitte lade die Seite neu.</v-alert>
    </v-col>
  </v-row>
</template>
