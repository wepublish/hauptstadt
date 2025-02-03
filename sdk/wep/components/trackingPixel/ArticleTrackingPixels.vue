<script lang="ts">
import Vue, {PropType} from 'vue'
import TrackingPixel from '~/sdk/wep/models/trackingPixel/TrackingPixel'

export default Vue.extend({
  name: 'ArticleTrackingPixels',
  props: {
    trackingPixels: {
      type: Array as PropType<TrackingPixel[] | null>,
      required: true,
      default: null
    }
  },
  computed: {
    validTrackingPixels (): TrackingPixel[] {
      return this.trackingPixels?.filter(trackingPixel => !!trackingPixel.uri) || []
    }
  }
})
</script>

<template>
  <span>
    <img
      v-for="trackingPixel of validTrackingPixels"
      :key="trackingPixel.uri"
      :src="trackingPixel.uri"
      :width="0"
      :height="0"
      alt="tracking-pixel"
    />
  </span>
</template>