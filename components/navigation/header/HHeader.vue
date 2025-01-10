<template>
  <div
    class="fixed-header ml-md-n3"
    :class="{
      'header-out': headerOut,
      'header-in': !headerOut
    }"
  >
    <v-row
      class="no-gutters justify-center white pt-2 d-print-none"
      :class="showDenseHeader ? 'header-height-dense pt-sm-3 pt-md-6 pt-lg-4 pt-xl-1' : 'header-height pt-sm-4 pt-md-7'"
    >
      <boxed-content
        id="header-position"
      >
        <v-row class="no-gutters align-center">
          <!-- burger menu -->
          <v-col
            class="col-2 cursor-pointer pl-6 pl-sm-12 mb-n1 mb-xl-0 font-size-25 font-size-md-30 font-size-lg-35 font-size-xl-45"
            @click="$store.commit('navigation/toggleMenu')"
          >
            <div class="position-relative">
              <span
                v-if="isMenuOpen"
                class="fal fa-times"
              />
              <span
                v-else
                class="fal fa-bars"
              />
              <!-- unpaid invoices -->
              <invoice-hint-header v-if="!isMenuOpen && unpaidInvoices" />
            </div>
          </v-col>
          <!-- main logo -->
          <v-col
            class="col-8 cursor-pointer"
            @click="clickLogo()"
          >
            <v-row class="justify-center no-gutters align-center">
              <v-col class="col-auto">
                <img
                  align="middle"
                  :class="showDenseHeader ? 'logo-width-dense' : 'logo-width'"
                  src="~/assets/images/logo.svg"
                >
              </v-col>
            </v-row>
          </v-col>
          <v-col
            align-self="end"
            class="text-right col-2 cursor-pointer pr-6 pr-sm-12 font-size-20 font-size-md-25 font-size-lg-30 font-size-xl-40"
            @click="$store.commit('navigation/toggleMenu')"
          >
            <span
              v-if="!showDenseHeader"
              class="fal fa-search"
            />
          </v-col>
        </v-row>

        <!-- claim -->
        <v-row
          class="justify-center cursor-pointer mt-0"
        >
          <v-col
            class="col-auto pt-0 pt-sm-2 pt-md-3 pt-lg-4 pt-xl-4"
            @click="clickLogo()"
          >
            <transition name="claim">
              <img
                v-if="!showDenseHeader"
                class="claim-width"
                src="~/assets/images/logo-claim.svg"
              >
            </transition>
          </v-col>
        </v-row>

        <!-- primary line -->
        <v-row
          v-if="$vuetify.breakpoint.smAndUp && !showDenseHeader"
        >
          <v-col
            v-if="!showPaywall || minimizedSquareView"
            class="col-12 px-7 pt-5 pt-sm-2 pt-md-4 pt-lg-6 pt-xl-9"
          >
            <div
              class="black-line-transition primary-line-1"
            />
          </v-col>
        </v-row>

        <!-- paywall -->
        <v-row
          v-if="showPaywall && !showDenseHeader && !minimizedSquareView && !hiddenByOtherPaywall"
          class="primary mx-0 mx-md-4"
        >
          <v-col class="col-12 px-4">
            <paywall-content :paywalls="paywalls" />
          </v-col>
        </v-row>
      </boxed-content>
    </v-row>

    <!-- primary line -->
    <v-row class="justify-center no-gutters d-print-none">
      <boxed-content>
        <div
          v-if="showDenseHeader"
          class="mt-n5 mt-sm-n4 mt-md-n6 mt-lg-n7 line-container white px-md-4"
        >
          <div class="white pt-2" />
          <div class="primary-line-1" />
        </div>

        <!-- paywall mobile -->
        <v-row
          v-if="showPaywall && showDenseHeader && !minimizedSquareView && !hiddenByOtherPaywall"
          class="primary mt-n6 mx-0 mx-md-4"
        >
          <v-col class="col-12 pt-8 px-4">
            <paywall-content :paywalls="paywalls" />
          </v-col>
        </v-row>
      </boxed-content>
    </v-row>

    <!-- print header -->
    <v-row class="no-gutters justify-center white py-8 my-0 d-none d-print-block">
      <v-row class="justify-center no-gutters align-center">
        <v-col class="col-auto">
          <img
            align="middle"
            class="logo-width"
            src="~/assets/images/logo.svg"
          >
        </v-col>
      </v-row>
      <v-row class="justify-center mt-0">
        <v-col class="col-auto">
          <img
            class="claim-width"
            src="~/assets/images/logo-claim.svg"
          >
        </v-col>
      </v-row>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import BoxedContent from '~/components/layout/BoxedContent.vue'
import PaywallContent from '~/components/paywall/PaywallContent.vue'
import Paywalls from '~/sdk/wep-cms/models/paywall/Paywalls'
import User from '~/sdk/wep/models/user/User'
import InvoiceHintHeader from '~/components/navigation/header/invoiceHint/InvoiceHintHeader.vue'

export default Vue.extend({
  name: 'HHeader',
  components: { InvoiceHintHeader, PaywallContent, BoxedContent },
  data () {
    return {
      PATH_IN_READ_MODE: ['/a', '/p'],
      PATH_HIDES_PAYWALL: ['/login', '/abo', '/probe-abo', '/profile', '/deactivated-abos', '/abo-details', '/open-invoice'],
      hiddenByOtherPaywall: false,
      windowHeight: null as number | null,
      headerOut: false as boolean,
      lastScrollPosition: 0 as number
    }
  },
  computed: {
    // helper
    denseHeader (): boolean {
      return this.$store.getters['navigation/denseHeader']
    },
    isMenuOpen (): boolean {
      return this.$store.getters['navigation/menuOpen']
    },
    showDenseHeader (): boolean {
      return !this.isMenuOpen && this.denseHeader
    },
    isRouteInReadMode (): boolean {
      const currentPath = this.$route.path
      const isPathInReadMode = !!this.PATH_IN_READ_MODE.find(path => currentPath.startsWith(path))
      if (isPathInReadMode) {
        return true
      }
      return false
    },
    // user is logged in and has a valid subscription
    hasAccess (): boolean {
      return this.$store.getters['auth/hasAccess']
    },
    // the paywall instance from the store which is initialized in default.vue
    paywalls (): undefined | Paywalls {
      return (this.$store.getters['paywall/headerPaywalls'] as undefined | Paywalls)
    },
    // routes where paywall shouldn't be displayed
    routeHidesPaywall (): boolean {
      return !!this.PATH_HIDES_PAYWALL.find(currentPath => this.$route.path.startsWith(currentPath))
    },
    // user doesn't have a valid subscription, paywall content is available, menu is closed and route doesn't hide the paywall to be shown
    showPaywall (): boolean {
      return !this.hasAccess && !!this.paywalls?.hasPaywalls() && !this.isMenuOpen && !this.routeHidesPaywall
    },
    minimizedSquareView (): boolean {
      return this.showPaywall && !!this.paywalls?.isMinimized() && this.$vuetify.breakpoint.mdAndUp
    },
    me (): undefined | User {
      return this.$store.getters['auth/me']
    },
    unpaidInvoices (): boolean {
      return !!this.me?.invoices?.indicateOpenInvoices(this.$config.AUTO_CHARGE_PAYMENT_METHOD_SLUGS, this.me?.subscriptions)
    }
  },
  watch: {
    minimizedSquareView () {
      this.handleMinimizedSquareView()
    },
    hiddenByOtherPaywall () {
      this.handleMinimizedSquareView()
    }
  },
  mounted () {
    this.windowHeight = window.outerHeight
    window.addEventListener('scroll', this.updateScroll)
  },
  methods: {
    async clickLogo (): Promise<void> {
      if (this.isMenuOpen) {
        this.$store.commit('navigation/toggleMenu')
      }
      await this.$router.push('/')
      await this.$vuetify.goTo(0, { duration: 0 })
    },
    updateScroll () {
      const scrollPosition = window.scrollY
      this.handleDenseHeader(scrollPosition)
      this.handleScrollDirection(scrollPosition)
      this.avoidPaywallOverlay()
    },
    avoidPaywallOverlay (): void {
      const headerEl = document.getElementById('header-position')
      const paywallEl = document.getElementsByClassName('element-identifier-paywall-content')
      // in case paywall has to be shown, but it has been hidden on another route
      if (this.showPaywall && paywallEl.length < 1) {
        this.hiddenByOtherPaywall = false
        return
      }
      // elements not available
      if (paywallEl.length < 2 && !this.hiddenByOtherPaywall && !this.minimizedSquareView) {
        this.hiddenByOtherPaywall = false
        return
      }
      // elements not available
      if (!headerEl || !paywallEl) {
        return
      }
      const paywallRect = paywallEl[paywallEl.length - 1].getBoundingClientRect()
      const screenHeight = screen.height
      const bottomDiff = screenHeight - paywallRect.top
      const compareDiff = this.minimizedSquareView ? 0 : 150
      if (bottomDiff > compareDiff) {
        this.hiddenByOtherPaywall = true
      } else {
        this.hiddenByOtherPaywall = false
      }
    },
    handleMinimizedSquareView () {
      if (this.minimizedSquareView && !this.hiddenByOtherPaywall) {
        this.$nuxt.$emit('showMinimizedPaywallSquare')
      } else {
        this.$nuxt.$emit('hideMinimizedPaywallSquare')
      }
    },
    handleDenseHeader (scrollPosition: number): void {
      if (scrollPosition > 0) {
        this.$store.commit('navigation/setDenseHeader', true)
      } else {
        this.$store.commit('navigation/setDenseHeader', false)
      }
    },
    handleScrollDirection (scrollPosition: number): void {
      if (scrollPosition > 100 && scrollPosition > this.lastScrollPosition) {
        this.handleHeaderOut()
      } else if (scrollPosition < this.lastScrollPosition) {
        this.handleHeaderIn()
      }
      this.lastScrollPosition = scrollPosition
    },
    handleHeaderOut (): void {
      if (this.isMenuOpen || this.showPaywall) {
        this.headerOut = false
        return
      }
      if (this.isRouteInReadMode) {
        this.headerOut = true
      }
    },
    handleHeaderIn ():void {
      this.headerOut = false
    }
  }
})
</script>

<style lang="scss">
@import 'assets/styles/header';
</style>
