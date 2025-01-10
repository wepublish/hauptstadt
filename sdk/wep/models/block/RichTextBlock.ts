import {gql} from 'graphql-tag'
import Block from '~/sdk/wep/models/block/Block'
import {SlateNode} from '~/sdk/wep/classes/Slate'

export default class RichTextBlock extends Block {
  public richText?: SlateNode[]
  constructor({__typename, blockStyle, richText}: RichTextBlock) {
    super({__typename, blockStyle})
    this.richText = richText
  }

  public static richTextBlockFragment = gql`
    fragment richTextBlock on RichTextBlock {
      blockStyle
      richText
    }
  `
}
