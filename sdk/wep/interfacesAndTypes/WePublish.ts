import Article from '~/sdk/wep/models/wepPublication/article/Article'
import Page from '~/sdk/wep/models/wepPublication/page/Page'

export type SortOrder = 'Ascending' | 'Descending'
export type PaymentState =
  | 'Created'
  | 'Submitted'
  | 'RequiresUserAction'
  | 'Processing'
  | 'Paid'
  | 'Canceled'
  | 'Declined'
export type PaymentMethodId = 'stripe' | 'payrexx' | 'payrexx-invoice-only' | 'bexio'
export type PaymentProviderSlug = PaymentMethodId
export type ArticleSort = 'publishedAt' | 'updatedAt'
export interface ArticleFilter {
  authors?: number[]
  tags?: string[]
}

export type WepPublicationType = Article | Page
export type WepPublicationTypeName = 'Article' | 'Page'
