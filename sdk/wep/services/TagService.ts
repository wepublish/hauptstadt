import Service from '~/sdk/wep/services/Service'
import Vue from 'vue'
import Tag, {TagType} from '~/sdk/wep/models/tags/Tag'
import Tags from '~/sdk/wep/models/tags/Tags'
import {gql} from 'graphql-tag'

export interface TagFilter {
  tag?: string
  type?: TagType
}

export default class TagService extends Service {
  constructor ({vue}: {vue: Vue}) {
    super({vue})
  }

  async getTags ({filter, take}: {filter?: TagFilter, take?: number}): Promise<Tags | undefined | false> {
    try {
      const query = gql`
        query Tags($take: Int, $filter: TagFilter) {
            tags(take: $take, filter: $filter) {
              nodes {
                ...tag
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
              totalCount
            }
        }${Tag.tagFragment}`
      const response = await this.$apollo.query({
        query,
        variables: {
          take,
          filter
        }
      })
      return new Tags().parse(response?.data?.tags?.nodes as unknown as Tag[])
    } catch (e) {
      this.alert({
        title: 'Tags konnten nicht abgerufen werden',
        type: 'error'
      })
      return false
    }
  }
}