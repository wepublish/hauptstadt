import gql from 'graphql-tag'
import TrackingPixelMethod from './TrackingPixelMethod'

export default class TrackingPixel {
  
  constructor(
    public id: string,
    public trackingPixelMethod: TrackingPixelMethod,
    public uri?: string | null
  ) {}

  public static trackingPixelFragment = gql`
    fragment trackingPixel on TrackingPixel {
      id
      trackingPixelMethod {
        trackingPixelProviderType
      }
      uri
    }
  `
}