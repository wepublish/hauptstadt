export type BlockTypename =
  | 'TeaserGridBlock'
  | 'RichTextBlock'
  | 'ImageBlock'
  | 'TitleBlock'
  | 'ImageGalleryBlock'
  | 'ListicleBlock'
  | 'QuoteBlock'
  | 'EmbedBlock'
  | 'TwitterTweetBlock'
  | 'InstagramPostBlock'
  | 'LinkPageBreakBlock'
  | 'YouTubeVideoBlock'
  | 'PollBlock'
  | 'HTMLBlock'
  // custom directus blocks
  | 'CrowdfundingBlock'
  | 'PaywallBlock'

export interface BlockProps {
  __typename: BlockTypename
  blockStyle?: string
  hiddenByPaywall?: boolean
}

export default class Block {
  public __typename: BlockTypename
  public blockStyle?: string
  public hiddenByPaywall?: boolean

  constructor({__typename, blockStyle, hiddenByPaywall}: BlockProps) {
    this.__typename = __typename
    this.blockStyle = blockStyle
    this.hiddenByPaywall = !!hiddenByPaywall
  }
}
