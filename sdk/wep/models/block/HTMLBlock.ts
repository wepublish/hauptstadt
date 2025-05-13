import {gql} from 'graphql-tag'
import Block from '~/sdk/wep/models/block/Block'

export default class HTMLBlock extends Block {
  public html?: string

  constructor({__typename, blockStyle, html}: HTMLBlock) {
    super({__typename, blockStyle})
    this.html = html
  }

  public static htmlBlockFragment = gql`
    fragment htmlBlock on HTMLBlock {
      html
      blockStyle
    }
  `
}
