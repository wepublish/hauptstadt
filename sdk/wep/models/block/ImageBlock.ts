import {gql} from 'graphql-tag'
import Block from '~/sdk/wep/models/block/Block'
import WepImage from '~/sdk/wep/models/image/WepImage'

export default class ImageBlock extends Block {
  public caption?: string
  public image?: WepImage
  constructor({__typename, blockStyle, caption, image}: ImageBlock) {
    super({__typename, blockStyle})
    this.caption = caption
    this.image = image ? new WepImage(image) : undefined
  }

  public static imageBlockFragment = gql`
    fragment imageBlock on ImageBlock {
      blockStyle
      caption
      image {
        ...image
      }
    }
    ${WepImage.wepImageFragment}
  `
}
