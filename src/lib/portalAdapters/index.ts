import { StepStoneAdapter } from './stepStoneAdapter'
import { IndeedAdapter } from './indeedAdapter'
import { LinkedInAdapter } from './linkedInAdapter'
import { XingAdapter } from './xingAdapter'

export const portalAdapters = {
  stepstone: new StepStoneAdapter(),
  indeed: new IndeedAdapter(),
  linkedin: new LinkedInAdapter(),
  xing: new XingAdapter()
}