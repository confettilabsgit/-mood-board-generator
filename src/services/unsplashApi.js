const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'demo'

const API_BASE = 'https://api.unsplash.com'

const styleKeywords = {
  modern: ['minimalist', 'contemporary', 'clean', 'geometric', 'architecture'],
  vintage: ['vintage', 'retro', 'antique', 'classic', 'old'],
  bohemian: ['bohemian', 'artistic', 'creative', 'eclectic', 'boho'],
  industrial: ['industrial', 'urban', 'concrete', 'metal', 'factory'],
  nature: ['nature', 'forest', 'landscape', 'botanical', 'organic'],
  luxury: ['luxury', 'elegant', 'sophisticated', 'premium', 'gold']
}

export const searchImages = async (style, color, count = 9) => {
  try {
    const keywords = styleKeywords[style] || styleKeywords.modern
    const query = keywords.join(' OR ')
    
    const response = await fetch(
      `${API_BASE}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch images')
    }
    
    const data = await response.json()
    
    return data.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      thumb: photo.urls.thumb,
      alt: photo.alt_description || `${style} style image`,
      credit: {
        name: photo.user.name,
        link: photo.user.links.html
      }
    }))
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error)
    return getFallbackImages(style)
  }
}

const getFallbackImages = (style) => {
  const fallbackImages = {
    modern: [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', alt: 'Modern architecture' },
      { url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800', alt: 'Clean interior' },
      { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800', alt: 'Minimalist design' },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', alt: 'Contemporary space' }
    ],
    vintage: [
      { url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800', alt: 'Vintage camera' },
      { url: 'https://images.unsplash.com/photo-1544967919-6baa227ccfb7?w=800', alt: 'Retro items' },
      { url: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=800', alt: 'Classic objects' },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: 'Antique items' }
    ],
    bohemian: [
      { url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800', alt: 'Bohemian textiles' },
      { url: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800', alt: 'Artistic elements' },
      { url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800', alt: 'Creative space' },
      { url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800', alt: 'Eclectic decor' }
    ],
    industrial: [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', alt: 'Industrial space' },
      { url: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=800', alt: 'Urban architecture' },
      { url: 'https://images.unsplash.com/photo-1572721546624-05bf65ad7679?w=800', alt: 'Concrete structures' },
      { url: 'https://images.unsplash.com/photo-1555838693-7b3e8e6c0e95?w=800', alt: 'Metal elements' }
    ],
    nature: [
      { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', alt: 'Forest landscape' },
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: 'Natural elements' },
      { url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800', alt: 'Botanical scene' },
      { url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800', alt: 'Organic textures' }
    ],
    luxury: [
      { url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800', alt: 'Luxury interior' },
      { url: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800', alt: 'Elegant design' },
      { url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800', alt: 'Sophisticated space' },
      { url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800', alt: 'Premium materials' }
    ]
  }

  return (fallbackImages[style] || fallbackImages.modern).map((img, index) => ({
    id: `fallback-${style}-${index}`,
    url: img.url,
    thumb: img.url + '&w=400',
    alt: img.alt,
    credit: { name: 'Unsplash', link: 'https://unsplash.com' }
  }))
}