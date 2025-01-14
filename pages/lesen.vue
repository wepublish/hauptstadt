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
import CreateMemberPlanView from '~/sdk/wep/components/memberPlan/CreateMemberPlanView.vue'
import {PropertyValue} from '~/sdk/wep/models/properties/Property'
import HtmlBlockView from '~/components/blocks/HtmlBlockView.vue'

export default defineComponent({
  name: 'lesen',
  components: {
    HtmlBlockView,
    CreateMemberPlanView, ImgDescription, TeaserGridBlockView, TitleBlockView, HImage, BlocksView},
  data () {
    return {
      seoPage: undefined as undefined | Page,
      page: undefined as undefined | Page,
      PAGE_SLUG: 'lesen',
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
    },
    memberPlanTags (): undefined | PropertyValue[] {
      const memberPlanTag = this.page?.properties?.findPropertyByKey('member-plan-tag')?.value
      return memberPlanTag ? [memberPlanTag] : undefined
    }
  },
  methods: {
    async loadPage (reduced: boolean = false): Promise<Page | false> {
      return await new PageService({ vue: this }).getPage({ slug: this.PAGE_SLUG, reduced })
    },
    slateToHtml (block: RichTextBlock): string {
      const richText = block.richText
      if (!richText) return ''
      return new Slate({fontClassHeadings: ''}).toHtml(richText)
    }
  }
})
</script>

<template>
  <v-row class="mb-12 pb-12">
    
    <!-- login ? -->
    <v-col class="col-12 text-right">
      <nuxt-link to="/login">
        <v-btn outlined :small="$vuetify.breakpoint.smAndDown">
          Einloggen
        </v-btn>
      </nuxt-link>
      <p class="pt-1 pt-md-2 caption-12 caption-md-16">Du hast bereits ein Abo?</p>
    </v-col>
    
    <!-- iterate blocks -->
    <v-col
      v-if="blocks?.blocks.length"
      class="pt-md-12"
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
            v-if="block?.image && block?.caption"
            :image="block?.image"
            :caption="block?.caption"
          />
        </v-col>
        
        <!-- title -->
        <v-col
          v-else-if="block.__typename === 'TitleBlock'"
          class="col-12 col-md-10 text-center"
        >
          <title-block-view :title-block="block" />
          
          <!-- member plan form -->
          <v-row
            v-if="block.blockStyle === 'member-plan-form'"
            class="justify-center text-left"
            id="abo"
          >
            <v-col class="max-width-840 py-12">
              <create-member-plan-view
                :member-plan-tags="memberPlanTags"
              />
            </v-col>
          </v-row>
        </v-col>
        
        <!-- button -->
        <v-col
          v-else-if="block.__typename === 'LinkPageBreakBlock'"
          class="text-center"
        >
          <v-btn
            :href="block.linkURL"
            class="elevation-0 white--text"
            color="black"
            x-large
            :min-height="$vuetify.breakpoint.mdAndUp ? 90 : 60"
            :min-width="$vuetify.breakpoint.mdAndUp ? 380 : 240"
          >
            <h1 class="title-24">{{block.linkText}}</h1>
          </v-btn>
        </v-col>
        
        <!-- article teaser -->
        <v-col
          v-else-if="block.__typename === 'TeaserGridBlock'"
          class="col-12 mt-6"
        >
          <teaser-grid-block-view
            :teaser-grid-block="block"
          />
        </v-col>
        
        <!-- rich text -->
        <v-col
          v-else-if="block.__typename === 'RichTextBlock'"
          class="line-height-1-6"
          :class="block.blockStyle === 'col-4' ? 'col-12' : 'col-12 col-sm-8 col-md-6'"
        >
          <div
            :class="block.blockStyle === 'col-4' ? 'rich-text-columns' : ''"
            v-html="slateToHtml(block)"
          />
        </v-col>
        
        <!-- html block / spacer -->
        <v-col
          v-else-if="block.__typename === 'HTMLBlock'"
        >
          <html-block-view :html-block="block" />
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
</style>