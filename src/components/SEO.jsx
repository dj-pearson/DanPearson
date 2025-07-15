import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import StructuredData from './StructuredData'

const SEO = ({ 
  title, 
  description, 
  image, 
  article = false, 
  author = 'Dan Pearson',
  publishedTime,
  modifiedTime,
  tags = [],
  canonicalUrl
}) => {
  const location = useLocation()
  const siteUrl = 'https://danpearson.com'
  const currentUrl = canonicalUrl || `${siteUrl}${location.pathname}`
  
  const siteTitle = 'Dan Pearson - Sales Leader, NFT Developer & AI Enthusiast'
  const siteDescription = 'Experienced sales leader with 15+ years expertise in NFT development, AI integration, and business innovation. Specializing in cutting-edge technology solutions.'
  const defaultImage = `${siteUrl}/images/og-default.jpg`
  
  const seoTitle = title ? `${title} | Dan Pearson` : siteTitle
  const seoDescription = description || siteDescription
  const seoImage = image || defaultImage
  
  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{seoTitle}</title>
        <meta name="title" content={seoTitle} />
        <meta name="description" content={seoDescription} />
        <meta name="author" content={author} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href={currentUrl} />
        
        {/* Viewport and Mobile Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={article ? 'article' : 'website'} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Dan Pearson" />
        <meta property="og:locale" content="en_US" />
        
        {article && (
          <>
            <meta property="article:author" content={author} />
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {tags.map((tag, index) => (
              <meta key={index} property="article:tag" content={tag} />
            ))}
          </>
        )}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
        <meta name="twitter:creator" content="@danpearson" />
        <meta name="twitter:site" content="@danpearson" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#06b6d4" />
        <meta name="msapplication-TileColor" content="#06b6d4" />
        <meta name="application-name" content="Dan Pearson Portfolio" />
        
        {/* Preconnect to External Domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        
        {/* Favicon and Icons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Critical Resource Hints */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Dan Pearson Portfolio",
            "url": siteUrl,
            "description": siteDescription,
            "author": {
              "@type": "Person",
              "name": "Dan Pearson",
              "url": siteUrl,
              "sameAs": [
                "https://linkedin.com/in/danpearson",
                "https://twitter.com/danpearson"
              ]
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteUrl}/search?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      
      <StructuredData 
        type={article ? 'article' : 'website'}
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        url={currentUrl}
        author={author}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
        tags={tags}
      />
    </>
  )
}

export default SEO