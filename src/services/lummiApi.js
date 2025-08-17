// Lummi.ai API integration for color-based image search
const LUMMI_API_BASE = 'https://api.lummi.ai/v1'

// Note: You'll need to get an API key from Lummi.ai
const LUMMI_API_KEY = process.env.REACT_APP_LUMMI_API_KEY || 'demo'

export const searchLummiImages = async (query, color, count = 12, additionalFilters = []) => {
  try {
    // Build search parameters
    const params = new URLSearchParams({
      q: [query, ...additionalFilters].join(' '),
      limit: count.toString(),
    })

    // Add color filter if provided
    if (color && color.startsWith('#')) {
      params.append('color', color)
    }

    const response = await fetch(`${LUMMI_API_BASE}/images?${params}`, {
      headers: {
        'Authorization': `Bearer ${LUMMI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Lummi API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform Lummi response to our expected format
    return data.images?.map(image => ({
      id: image.id,
      url: image.urls?.regular || image.urls?.small || image.url,
      alt: image.alt_description || image.description || 'Lummi image',
      colors: image.color_palette || [],
      dominantColor: image.dominant_color,
      colorWeights: image.color_weights || {},
      width: image.width,
      height: image.height,
      source: 'lummi'
    })) || []

  } catch (error) {
    console.error('Error fetching from Lummi:', error)
    // Fallback to mock data for development
    return generateMockLummiImages(query, color, count)
  }
}

// Search images by dominant color
export const searchByDominantColor = async (color, style, count = 8) => {
  try {
    const params = new URLSearchParams({
      dominant_color: color,
      q: style,
      limit: count.toString(),
    })

    const response = await fetch(`${LUMMI_API_BASE}/images?${params}`, {
      headers: {
        'Authorization': `Bearer ${LUMMI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Lummi API error: ${response.status}`)
    }

    const data = await response.json()
    return transformLummiResponse(data)

  } catch (error) {
    console.error('Error fetching by dominant color:', error)
    return generateMockLummiImages(style, color, count)
  }
}

// Get curated image collections based on color psychology
export const getCuratedColorCollection = async (color, mood, count = 6) => {
  const moodKeywords = {
    energetic: ['dynamic', 'vibrant', 'action', 'movement'],
    calm: ['peaceful', 'serene', 'tranquil', 'minimal'],
    sophisticated: ['elegant', 'luxury', 'premium', 'refined'],
    creative: ['artistic', 'unique', 'innovative', 'expressive'],
    natural: ['organic', 'earth', 'nature', 'sustainable']
  }

  const keywords = moodKeywords[mood] || moodKeywords.calm
  
  try {
    const params = new URLSearchParams({
      q: keywords.join(' '),
      color: color,
      limit: count.toString(),
      sort: 'relevance'
    })

    const response = await fetch(`${LUMMI_API_BASE}/collections/curated?${params}`, {
      headers: {
        'Authorization': `Bearer ${LUMMI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Lummi API error: ${response.status}`)
    }

    const data = await response.json()
    return transformLummiResponse(data)

  } catch (error) {
    console.error('Error fetching curated collection:', error)
    return generateMockLummiImages(keywords.join(' '), color, count)
  }
}

// Helper to transform Lummi API response
const transformLummiResponse = (data) => {
  return data.images?.map(image => ({
    id: image.id,
    url: image.urls?.regular || image.urls?.small || image.url,
    alt: image.alt_description || image.description || 'Lummi image',
    colors: image.color_palette || [],
    dominantColor: image.dominant_color,
    colorWeights: image.color_weights || {},
    width: image.width,
    height: image.height,
    source: 'lummi'
  })) || []
}

// Generate mock data for development/fallback
const generateMockLummiImages = (query, color, count) => {
  const mockImages = [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400', 
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400',
    'https://images.unsplash.com/photo-1493663284031-b7e3aac4c7f5?w=400',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  ]

  return Array.from({ length: count }, (_, index) => ({
    id: `mock-lummi-${index}`,
    url: mockImages[index % mockImages.length],
    alt: `${query} image ${index + 1}`,
    colors: [color, '#ffffff', '#000000'],
    dominantColor: color,
    colorWeights: { [color]: 0.6, '#ffffff': 0.3, '#000000': 0.1 },
    width: 400,
    height: 300,
    source: 'lummi-mock'
  }))
}

// Analyze color composition of images
export const analyzeImageColors = (image) => {
  if (!image.colors || !image.colorWeights) {
    return {
      hasStrongColor: false,
      dominantColorWeight: 0,
      isMonochromatic: false
    }
  }

  const dominantWeight = image.colorWeights[image.dominantColor] || 0
  const hasStrongColor = dominantWeight > 0.4
  const isMonochromatic = image.colors.length <= 2

  return {
    hasStrongColor,
    dominantColorWeight: dominantWeight,
    isMonochromatic,
    colorCount: image.colors.length,
    primaryColors: image.colors.slice(0, 3)
  }
}

// Smart image categorization for mood boards
export const categorizeImagesByColor = (images, targetColor) => {
  const categorized = {
    colorPop: [], // Images with strong target color presence
    neutral: [],  // Images with muted/neutral colors
    blackWhite: [] // Images with minimal color
  }

  images.forEach(image => {
    const analysis = analyzeImageColors(image)
    
    if (analysis.hasStrongColor && isColorSimilar(image.dominantColor, targetColor)) {
      categorized.colorPop.push({ ...image, isColorPop: true })
    } else if (analysis.isMonochromatic || analysis.dominantColorWeight < 0.3) {
      categorized.blackWhite.push({ ...image, isColorPop: false })
    } else {
      categorized.neutral.push({ ...image, isColorPop: false })
    }
  })

  return categorized
}

// Helper to check if two colors are similar
const isColorSimilar = (color1, color2, threshold = 40) => {
  if (!color1 || !color2) return false
  
  // Convert hex to RGB
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return false
  
  // Calculate color distance
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) + 
    Math.pow(rgb1.b - rgb2.b, 2)
  )
  
  return distance < threshold
}

// Helper to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}