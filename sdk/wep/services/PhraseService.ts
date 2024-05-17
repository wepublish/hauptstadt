import Vue from 'vue'
import {gql} from 'graphql-tag'
import Service from '~/sdk/wep/services/Service'
import Article from '~/sdk/wep/models/wepPublication/article/Article'
import Articles from '../models/wepPublication/article/Articles'
import PageInfo from '../models/wepPublication/page/PageInfo'
import ReducedArticle from '../models/wepPublication/article/ReducedArticle'
import { ArticleSort, SortOrder } from '../interfacesAndTypes/WePublish'

export default class PhraseService extends Service {
  constructor({vue}: {vue: Vue}) {
    super({vue})
  }

  /**
   * Fetch articles and pages by search term from wep api.
   * @param searchQuery
   */
  async searchPhrase({searchQuery, take, skip, articleSort, order}: {searchQuery: String, take?: number, skip?: number, articleSort?: ArticleSort, order?: SortOrder}): Promise<Articles | false> {
    if (!searchQuery) {
      throw new Error('No query provided in searchPhrase() method within PhraseService class.')
    }
    this.vue.$nextTick(() => {
      this.loadingStart()
    })
    try {
      const query = gql`
        query Phrase($query: String!, $take: Int, $skip: Int, $articleSort: ArticleSort, $order: SortOrder) {
          phrase(query: $query, take: $take, skip: $skip, articleSort: $articleSort, order: $order) {
            articles {
              nodes {
                ...reducedArticle
              }
              pageInfo {
                ...pageInfo
              }
              totalCount
            }
          }
        }
        ${ReducedArticle.reducedArticleFragment}
        ${PageInfo.pageInfoFragment}
      `

      const response = await this.$apollo.query({
        query,
        variables: {
          query: searchQuery,
          take,
          skip,
          articleSort,
          order
        },
        errorPolicy: 'all'
      })
      if (response.data.phrase.articles.totalCount === 0) {
        return false
      }

      const articles = new Articles(response.data.phrase.articles, true)
      this.loadingFinish()
      return articles
    } catch (e) {
      this.loadingFinish()
      this.alert({
        title: 'Seite konnte nicht abgerufen werden.',
        type: 'error'
      })
    }
    return false
  }
}
