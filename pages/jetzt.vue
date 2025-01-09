<script lang="ts">
import {defineComponent} from 'vue'
import BlocksView from '~/components/blocks/BlocksView.vue'
import Page from '~/sdk/wep/models/wepPublication/page/Page'
import {MetaInfo} from 'vue-meta'
import PageService from '~/sdk/wep/services/PageService'
import Blocks from '~/sdk/wep/models/block/Blocks'
import ImageBlock from '~/sdk/wep/models/block/ImageBlock'
import HImage from '~/components/img/HImage.vue'
import TitleBlockView from '~/components/blocks/TitleBlockView.vue'
import LinkPageBreakBlock from '../sdk/wep/models/block/LinkPageBreakBlock'
import TeaserGridBlockView from '~/components/blocks/TeaserGridBlockView.vue'
import Slate from '~/sdk/wep/classes/Slate'
import RichTextBlock from '~/sdk/wep/models/block/RichTextBlock'
import ImgDescription from '~/components/img/ImgDescription.vue'

export default defineComponent({
  name: 'jetzt',
  components: {ImgDescription, TeaserGridBlockView, TitleBlockView, HImage, BlocksView},
  data () {
    return {
      seoPage: undefined as undefined | Page,
      page: undefined as undefined | Page,
      PAGE_SLUG: 'jetzt',
      Slate
    }
  },
  async fetch (): Promise<void> {
    // only fetch seo page server side
    if (typeof window !== 'undefined') { return }
    const page = await this.loadPage(true)
    if (!page) {
      return
    }
    this.seoPage = page
  },
  head (): MetaInfo {
    const page = this.seoPage instanceof Page ? this.seoPage : this.page
    if (!page) { return {} }
    return page.getSeoHead({
      description: page.description,
      baseUrl: this.$config.BASE_URL,
      fallBackImageUrlPath: require('~/assets/images/logo-with-claim.png')
    })
  },
  async beforeMount () {
    // fixes https://hauptstadt.atlassian.net/browse/HA-121
    await this.$vuetify.goTo(0, { duration: 0 })
    
    const page = await this.loadPage()
    if (!page) {
      return
    }
    this.page = page
    window.dispatchEvent(new Event('scrollToSavedPosition'))
  },
  computed: {
    LinkPageBreakBlock() {
      return LinkPageBreakBlock
    },
    blocks (): Blocks | undefined {
      return this.page?.blocks
    },
    logo (): ImageBlock | undefined {
      return this.blocks?.getFirstBlockByType('ImageBlock')
    }
  },
  methods: {
    async loadPage (reduced: boolean = false): Promise<Page | false> {
      return await new PageService({ vue: this }).getPage({ slug: this.PAGE_SLUG, reduced })
    },
    slateToHtml (block: RichTextBlock): string {
      const richText = block.richText
      if (!richText) return ''
      return new Slate({fontClassParaphrase: 'column-break'}).toHtml(richText)
    }
  }
})
</script>

<template>
  <v-row class="mb-12 pb-12">
    
    <!-- iterate blocks -->
    <v-col
      v-if="blocks?.blocks.length"
      class="pt-24"
    >
      <v-row
        v-for="(block, blockIndex) in blocks?.blocks || []"
        :key="blockIndex"
        class="justify-center"
      >
        <!-- image -->
        <v-col
          v-if="block.__typename === 'ImageBlock'"
          class="col-12 text-center"
          :class="{
            'col-md-6': block.blockStyle === 'col-6',
            'col-md-10': block.blockStyle === 'col-10'
          }"
        >
          <img
            style="max-width: 100%;"
            :src="block?.image?.url"
            alt="Logo"
          >
          <img-description
            v-if="block?.image"
            :image="block?.image"
            :caption="block?.caption"
          />
        </v-col>
        
        <!-- title -->
        <v-col
          v-if="block.__typename === 'TitleBlock'"
          class="col-12 col-md-10 text-center pt-12"
        >
          <title-block-view :title-block="block" />
          
          <!-- member plan form -->
          
        </v-col>
        
        <!-- button -->
        <v-col
          v-if="block.__typename === 'LinkPageBreakBlock'"
          class="text-center pt-24"
        >
          <v-btn
            :href="block.linkURL"
            color="primary"
            x-large
            height="80"
            width="240"
          >
            {{block.linkText}}
          </v-btn>
        </v-col>
        
        <!-- article teaser -->
        <v-col
          v-if="block.__typename === 'TeaserGridBlock'"
          class="col-12 mt-6 pt-24"
        >
          <teaser-grid-block-view
            :teaser-grid-block="block"
          />
        </v-col>
        
        <!-- richtext -->
        <v-col
          v-if="block.__typename === 'RichTextBlock'"
          class="line-height-1-6"
          :class="block.blockStyle === 'col-4' ? 'col-12' : 'col-12 col-sm-8 col-md-6'"
        >
          <div
            :class="block.blockStyle === 'col-4' ? 'rich-text-columns' : ''"
            v-html="slateToHtml(block)"
          />
        </v-col>
      </v-row>
    </v-col>
    
    <!-- loading animation -->
    <v-col
      v-else
      class="col-12"
    >
      <v-row>
        <v-col v-for="i in 6" :key="i" class="col-12 col-sm-4">
          <v-skeleton-loader type="card" style="overflow-y: hidden;" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<style scoped lang="scss">
@import 'assets/styles/header';

@media #{map-get($display-breakpoints, 'sm-and-up')} {
  .rich-text-columns {
    column-count: 3;
    column-gap: calc(4 * 4px);
  }
}

@media #{map-get($display-breakpoints, 'md-and-up')} {
  .rich-text-columns {
    column-count: 3;
    column-gap: calc(32 * 4px);
  }
}

.max-width-200 {
  max-width: 600px;
}

.pt-24 {
  padding-top: calc(24 * 4px);
}
</style>