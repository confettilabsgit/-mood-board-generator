const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'demo'

const API_BASE = 'https://api.unsplash.com'

const styleKeywords = {
  modern: ['portrait', 'fashion', 'art', 'design', 'people', 'creative'],
  vintage: ['portrait', 'fashion', 'photography', 'art', 'people', 'culture'],
  bohemian: ['art', 'people', 'creative', 'culture', 'travel', 'lifestyle'],
  industrial: ['portrait', 'urban', 'street', 'people', 'art', 'design'],
  nature: ['landscape', 'nature', 'people', 'travel', 'food', 'outdoor'],
  luxury: ['fashion', 'portrait', 'lifestyle', 'art', 'culture', 'design']
}

export const searchImages = async (style, color, count = 9, aiKeywords = null) => {
  try {
    const keywords = aiKeywords || styleKeywords[style] || styleKeywords.modern
    const query = Array.isArray(keywords) ? keywords.join(' OR ') : keywords
    
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
    return getFallbackImages(query)
  }
}

const getFallbackImages = (searchTerm) => {
  // Colorful diverse fallback images (used when API fails)
  const diverseFallbackImages = [
    // Colorful portraits
    { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', alt: 'Portrait' },
    { url: 'https://images.unsplash.com/photo-1494790108755-2616c75b9b0f?w=800', alt: 'Colorful fashion' },
    // Vibrant landscapes  
    { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: 'Sunset landscape' },
    { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', alt: 'Autumn forest' },
    // Colorful objects/products
    { url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800', alt: 'Vintage colorful object' },
    { url: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=800', alt: 'Neon colors' },
    // Colorful food
    { url: 'https://images.unsplash.com/photo-1495521821757-a2efacb9c924?w=800', alt: 'Colorful food' },
    { url: 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=800', alt: 'Vibrant ingredients' },
    // Colorful art
    { url: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800', alt: 'Colorful abstract art' },
    { url: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800', alt: 'Vibrant street art' },
    // Urban colors
    { url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', alt: 'Colorful urban scene' },
    { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', alt: 'Architectural colors' }
  ]
  
  return diverseFallbackImages.map((img, index) => ({
    id: `fallback-diverse-${index}`,
    url: img.url,
    thumb: img.url + '&w=400',
    alt: img.alt,
    credit: { name: 'Unsplash', link: 'https://unsplash.com' }
  }))
}