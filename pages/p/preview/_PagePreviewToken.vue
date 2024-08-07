<template>
  <page-slug
    :token="$route.params.PagePreviewToken"
  />
</template>

<script lang="ts">
import Vue from 'vue'
import PageSlug from '~/pages/_PageSlug.vue'

export default Vue.extend({
  name: 'PagePreviewToken',
  components: { PageSlug }
})
</script>
