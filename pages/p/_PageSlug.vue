<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  asyncData ({redirect, route}) {
    const {PageSlug} = route.params
    if (PageSlug) {
      redirect(`/${PageSlug}`)
    }
  }
})
</script>