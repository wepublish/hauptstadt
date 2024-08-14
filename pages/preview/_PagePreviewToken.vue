<template>
  <page-slug
    :token="$route.params.PagePreviewToken"
  >
    <template ##preview>
      <v-alert type="info" color="primary" class="mb-0">
        Diese Seite ist nicht publiziert. Du siehst eine Vorschau.
      </v-alert>
    </template>
  </page-slug>
</template>

<script lang="ts">
import Vue from 'vue'
import PageSlug from '~/pages/_PageSlug.vue'

export default Vue.extend({
  name: 'PagePreviewToken',
  components: { PageSlug }
})
</script>
