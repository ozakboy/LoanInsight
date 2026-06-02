import { serverQueryContent } from '#content/server'

export default defineSitemapEventHandler(async (e) => {
  const docs = await serverQueryContent(e).find()
  return docs
    .filter((doc) => doc._path && !doc._draft)
    .map((doc) => ({
      loc: doc._path,
      lastmod: doc.date ? new Date(doc.date as string) : undefined,
      changefreq: 'monthly',
      priority: doc._path?.startsWith('/blog/') ? 0.7 : 0.5,
    }))
})
