import {gql} from 'graphql-tag'

export type TagType = 'Comment' | 'Event' | 'Author' | 'Article' | 'Page'

export interface TagProps {
  id: string
  tag: string
  type: TagType
}

export default class Tag {
  public id: string
  public tag: string
  public type: TagType

  constructor({id, tag, type}: TagProps) {
    this.id = id
    this.tag = tag
    this.type = type
  }

  public static tagFragment = gql`
    fragment tag on Tag {
      id
      tag
      type
    }
  `
}
