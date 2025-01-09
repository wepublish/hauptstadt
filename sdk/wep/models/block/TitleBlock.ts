import {gql} from 'graphql-tag'
import Block from '~/sdk/wep/models/block/Block'

export default class TitleBlock extends Block {
  public title?: string
  public lead?: string
  constructor({__typename, blockStyle, title, lead}: TitleBlock) {
    super({__typename, blockStyle})
    this.title = title
    this.lead = lead
  }

  public static titleBlockFragment = gql`
    fragment titleBlock on TitleBlock {
      blockStyle
      title
      lead
    }
  `
}
