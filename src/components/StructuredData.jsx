import { Helmet } from 'react-helmet-async'

const StructuredData = ({ 
  type = 'website',
  title,
  description,
  image,
  url,
  author = 'Dan Pearson',
  publishedTime,
  modifiedTime,
  tags = []
}) => {
  const siteUrl = 'https://danpearson.com'
  
  // Person Schema
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Dan Pearson",
    "url": siteUrl,
    "image": `${siteUrl}/images/dan-pearson.jpg`,
    "description": "Sales Leader, NFT Developer & AI Enthusiast with 15+ years of experience",
    "jobTitle": "Sales Leader & Technology Innovator",
    "worksFor": {
      "@type": "Organization",
      "name": "Dan Pearson Consulting"
    },
    "knowsAbout": [
      "Sales Leadership",
      "NFT Development",
      "Artificial Intelligence",
      "Blockchain Technology",
      "Business Innovation",
      "Auto-GPT",
      "OpenAI Integration",
      "Stable Diffusion"
    ],
    "sameAs": [
      "https://linkedin.com/in/danpearson",
      "https://twitter.com/danpearson",
      "https://github.com/danpearson"
    ],
    "alumniOf": {
      "@type": "Organization",
      "name": "Fitness Industry"
    },
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Sales Leader",
      "occupationLocation": {
        "@type": "Place",
        "name": "San Francisco, CA"
      },
      "skills": [
        "Sales Leadership",
        "NFT Development",
        "AI Integration",
        "Team Management",
        "Client Relations"
      ]
    }
  }
  
  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Dan Pearson Consulting",
    "url": siteUrl,
    "logo": `${siteUrl}/images/logo.png`,
    "description": "Expert consulting in sales leadership, NFT development, and AI integration",
    "founder": {
      "@type": "Person",
      "name": "Dan Pearson"
    },
    "foundingDate": "2020",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "customer service",
      "email": "dan@danpearson.com"
    },
    "sameAs": [
      "https://linkedin.com/company/danpearson-consulting",
      "https://twitter.com/danpearson"
    ],
    "serviceType": [
      "Sales Leadership Consulting",
      "NFT Development",
      "AI Integration Services",
      "Business Innovation Consulting"
    ]
  }
  
  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Dan Pearson Portfolio",
    "url": siteUrl,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Person",
      "name": "Dan Pearson"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "Person",
      "name": "Dan Pearson"
    }
  }
  
  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image,
    "url": url,
    "datePublished": publishedTime,
    "dateModified": modifiedTime || publishedTime,
    "author": {
      "@type": "Person",
      "name": author,
      "url": siteUrl
    },
    "publisher": {
      "@type": "Person",
      "name": "Dan Pearson",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/images/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "keywords": tags.join(', '),
    "articleSection": "Technology",
    "wordCount": description?.length || 0
  }
  
  // Creative Work Schema for Projects
  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": title,
    "description": description,
    "image": image,
    "url": url,
    "creator": {
      "@type": "Person",
      "name": "Dan Pearson"
    },
    "dateCreated": publishedTime,
    "genre": "Technology",
    "keywords": tags.join(', '),
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "copyrightHolder": {
      "@type": "Person",
      "name": "Dan Pearson"
    }
  }
  
  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": title,
        "item": url
      }
    ]
  }
  
  const getSchema = () => {
    switch (type) {
      case 'article':
        return [articleSchema, breadcrumbSchema, personSchema]
      case 'project':
        return [creativeWorkSchema, breadcrumbSchema, personSchema]
      case 'website':
      default:
        return [websiteSchema, personSchema, organizationSchema]
    }
  }
  
  return (
    <Helmet>
      {getSchema().map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema, null, 2)}
        </script>
      ))}
    </Helmet>
  )
}

export default StructuredData