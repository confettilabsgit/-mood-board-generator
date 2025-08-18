import { searchImages as searchUnsplash } from './unsplashApi'
import { 
  searchLummiImages, 
  searchByDominantColor, 
  getCuratedColorCollection,
  categorizeImagesByColor 
} from './lummiApi'
import { generateAIKeywords } from './aiService'

// Enhanced image search that combines Unsplash and Lummi (style disabled for now)
export const searchEnhancedImages = async (searchTerm, color, totalCount = 9, mode = 'mixed') => {
  try {
    let allImages = []

    if (mode === 'mixed' || mode === 'lummi') {
      // Get images from Lummi with color analysis
      const lummiCount = mode === 'lummi' ? totalCount : Math.ceil(totalCount * 0.6)
      const lummiImages = await searchLummiImages(searchTerm, color, lummiCount)
      allImages = [...allImages, ...lummiImages]
    }

    if (mode === 'mixed' || mode === 'unsplash') {
      // Fill remaining with Unsplash images
      const unsplashCount = mode === 'unsplash' ? totalCount : Math.max(3, totalCount - allImages.length)
      const unsplashImages = await searchUnsplash(searchTerm, color, unsplashCount, [])
      
      // Transform Unsplash images to include color analysis placeholder
      const enhancedUnsplashImages = unsplashImages.map(img => ({
        ...img,
        colors: [color, '#ffffff', '#000000'],
        dominantColor: color,
        source: 'unsplash'
      }))
      
      allImages = [...allImages, ...enhancedUnsplashImages]
    }

    // Shuffle and limit results
    const shuffledImages = shuffleArray(allImages).slice(0, totalCount)
    
    return shuffledImages

  } catch (error) {
    console.error('Error in enhanced image search:', error)
    // Fallback to Unsplash only with diverse search terms
    return await searchUnsplash(searchTerm, color, totalCount, [])
  }
}

// Smart mood board image curation
export const getCuratedMoodBoardImages = async (style, color, layout = 'milanote') => {
  try {
    const totalImages = Math.max(7, layout === 'milanote' ? 9 : 12) // Minimum 7 images

    // Strategy: Color-influenced diverse content mix
    const colorName = getColorName(color)
    const colorKeywords = getColorKeywords(color, colorName)
    
    const searchStrategies = [
      // Color-influenced portraits
      { terms: [`${colorName} portrait`, `${colorName} fashion`, `person ${colorKeywords[0]}`], count: 2 },
      // Color-influenced landscapes  
      { terms: [`${colorName} landscape`, `${colorName} nature`, `${colorKeywords[1]} scenery`], count: 2 },
      // Color-influenced objects
      { terms: [`${colorName} object`, `${colorKeywords[0]} product`, `${colorName} design`], count: 1 },
      // Color-influenced food (if applicable)
      { terms: [`${colorName} food`, `${colorKeywords[2]} coffee`, `colorful food`], count: 1 },
      // Color-influenced art
      { terms: [`${colorName} art`, `${colorKeywords[0]} painting`, `colorful illustration`], count: 1 },
      // Color-influenced urban
      { terms: [`${colorName} building`, `colorful street`, `${colorKeywords[1]} architecture`], count: 1 },
      // Color-influenced abstract
      { terms: [`${colorName} abstract`, `${colorKeywords[2]} texture`, `colorful pattern`], count: 1 }
    ]

    const [diverseImages] = await Promise.all([
      // Get truly diverse content WITHOUT style influence
      Promise.all(searchStrategies.map(async (strategy) => {
        const searchTerm = strategy.terms[Math.floor(Math.random() * strategy.terms.length)]
        console.log(`Color-based search: ${searchTerm} (for ${colorName} theme) with count: ${strategy.count}`)
        return await searchEnhancedImages(searchTerm, color, strategy.count, 'unsplash')
      })).then(results => results.flat().slice(0, totalImages))
    ])

    // Use the diverse images directly
    const allImages = diverseImages

    // If we don't have enough images, supplement with color-based searches
    if (allImages.length < totalImages) {
      const additionalSearches = [
        `${colorName} creative`,
        `${colorName} artistic`, 
        `${colorKeywords[0]} beautiful`,
        `${colorName} aesthetic`,
        `colorful ${colorKeywords[1]}`
      ]
      
      for (const searchTerm of additionalSearches) {
        if (allImages.length >= totalImages) break
        const moreImages = await searchEnhancedImages(
          searchTerm, 
          color, 
          totalImages - allImages.length, 
          'unsplash'
        )
        allImages.push(...moreImages)
      }
    }

    // Add content type metadata for varied sizing
    const enhancedImages = allImages.map((image, index) => ({
      ...image,
      contentType: getImageContentType(image, index),
      sizeVariant: getSizeVariant(index, totalImages)
    }))

    // Remove duplicates by URL and shuffle
    const uniqueImages = removeDuplicateImages(enhancedImages)
    return shuffleArray(uniqueImages).slice(0, totalImages)

  } catch (error) {
    console.error('Error in curated search:', error)
    // Fallback to diverse search terms without style
    const fallbackTerms = ['portrait', 'landscape', 'art', 'food', 'urban', 'nature', 'creative']
    const fallbackImages = []
    for (const term of fallbackTerms) {
      if (fallbackImages.length >= totalImages) break
      const images = await searchEnhancedImages(term, color, 1, 'unsplash')
      fallbackImages.push(...images)
    }
    return fallbackImages.slice(0, totalImages)
  }
}

// Get color-themed image collection
export const getColorThemedCollection = async (color, mood = 'modern', count = 6) => {
  try {
    // Use Lummi's curated collections for better color matching
    const curatedImages = await getCuratedColorCollection(color, mood, count)
    
    if (curatedImages.length >= count) {
      return curatedImages
    }

    // Supplement with enhanced search if needed
    const additionalImages = await searchEnhancedImages(mood, color, count - curatedImages.length)
    return [...curatedImages, ...additionalImages]

  } catch (error) {
    console.error('Error getting color-themed collection:', error)
    return await searchEnhancedImages(mood, color, count)
  }
}

// Style-specific image search with color intelligence
export const getStyleSpecificImages = async (style, color, preferences = {}) => {
  const {
    includeColorPop = true,
    includeBW = true,
    includeNeutral = true,
    totalCount = 9
  } = preferences

  try {
    const searchPromises = []

    if (includeColorPop) {
      searchPromises.push(
        searchByDominantColor(color, style, 3).then(images => 
          images.map(img => ({ ...img, category: 'colorPop', isColorPop: true }))
        )
      )
    }

    if (includeBW) {
      searchPromises.push(
        searchEnhancedImages(style, '#000000', 3, 'mixed').then(images =>
          images.map(img => ({ ...img, category: 'blackWhite', isColorPop: false }))
        )
      )
    }

    if (includeNeutral) {
      searchPromises.push(
        searchEnhancedImages(style, '#f5f5f5', 3, 'mixed').then(images =>
          images.map(img => ({ ...img, category: 'neutral', isColorPop: false }))
        )
      )
    }

    const results = await Promise.all(searchPromises)
    const allImages = results.flat()
    
    return shuffleArray(allImages).slice(0, totalCount)

  } catch (error) {
    console.error('Error in style-specific search:', error)
    return await searchEnhancedImages(style, color, totalCount)
  }
}

// Utility functions
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Image quality scoring for better curation
export const scoreImageQuality = (image) => {
  let score = 0
  
  // Prefer higher resolution images
  if (image.width && image.height) {
    const pixels = image.width * image.height
    if (pixels > 500000) score += 2  // High res
    else if (pixels > 200000) score += 1  // Medium res
  }
  
  // Prefer images with good color analysis
  if (image.colors && image.colors.length > 0) score += 1
  if (image.dominantColor) score += 1
  
  // Prefer Lummi images for better color data
  if (image.source === 'lummi') score += 1
  
  return score
}

// Sort images by quality and relevance
export const sortImagesByQuality = (images) => {
  return images.sort((a, b) => {
    const scoreA = scoreImageQuality(a)
    const scoreB = scoreImageQuality(b)
    return scoreB - scoreA
  })
}

// Determine content type for better layout decisions
const getImageContentType = (image, index) => {
  const alt = (image.alt || '').toLowerCase()
  const contentTypes = ['people', 'portrait', 'person', 'face']
  const architectureTypes = ['building', 'architecture', 'interior', 'room']
  const textTypes = ['typography', 'text', 'lettering', 'sign']
  const artTypes = ['drawing', 'illustration', 'sketch', 'art']
  
  if (contentTypes.some(type => alt.includes(type))) return 'people'
  if (architectureTypes.some(type => alt.includes(type))) return 'architecture'
  if (textTypes.some(type => alt.includes(type))) return 'typography'
  if (artTypes.some(type => alt.includes(type))) return 'art'
  
  // Distribute types evenly if not detected
  const types = ['people', 'architecture', 'typography', 'art', 'object']
  return types[index % types.length]
}

// Generate varied sizes for more interesting layouts
const getSizeVariant = (index, totalCount) => {
  const variants = [
    'small',    // 180x140
    'medium',   // 220x180  
    'large',    // 280x220
    'wide',     // 300x160
    'tall'      // 160x280
  ]
  
  // Ensure we have a good mix of sizes
  const sizePattern = [
    'large', 'small', 'medium', 'wide', 'small', 
    'medium', 'tall', 'small', 'large'
  ]
  
  return sizePattern[index % sizePattern.length] || 'medium'
}

// Get size dimensions based on variant
export const getSizeDimensions = (variant) => {
  const sizes = {
    small:  { width: 180, height: 140 },
    medium: { width: 220, height: 180 },
    large:  { width: 280, height: 220 },
    wide:   { width: 300, height: 160 },
    tall:   { width: 160, height: 280 }
  }
  
  return sizes[variant] || sizes.medium
}

// Remove duplicate images by URL
const removeDuplicateImages = (images) => {
  const seen = new Set()
  return images.filter(image => {
    const url = image.url || image.id
    if (seen.has(url)) {
      return false
    }
    seen.add(url)
    return true
  })
}

// Convert hex color to color name
const getColorName = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  
  // Convert to HSL for better color classification
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const diff = max - min
  
  let h = 0
  if (diff !== 0) {
    if (max === r / 255) h = ((g - b) / 255 / diff) % 6
    else if (max === g / 255) h = (b - r) / 255 / diff + 2
    else h = (r - g) / 255 / diff + 4
    h *= 60
    if (h < 0) h += 360
  }
  
  const l = (max + min) / 2
  const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1))
  
  // Determine color name based on HSL
  if (s < 0.1) return l > 0.7 ? 'white' : l < 0.3 ? 'black' : 'gray'
  
  if (h >= 0 && h < 30) return 'red'
  if (h >= 30 && h < 60) return 'orange'
  if (h >= 60 && h < 120) return 'yellow'
  if (h >= 120 && h < 180) return 'green'
  if (h >= 180 && h < 240) return 'blue'
  if (h >= 240 && h < 300) return 'purple'
  if (h >= 300 && h < 330) return 'pink'
  if (h >= 330) return 'red'
  
  return 'colorful'
}

// Get color-related keywords for search enhancement
const getColorKeywords = (hex, colorName) => {
  const colorKeywordMap = {
    red: ['vibrant', 'warm', 'bold'],
    orange: ['bright', 'energetic', 'warm'],
    yellow: ['sunny', 'bright', 'cheerful'],
    green: ['natural', 'fresh', 'organic'],
    blue: ['cool', 'calm', 'serene'],
    purple: ['rich', 'luxurious', 'deep'],
    pink: ['soft', 'romantic', 'delicate'],
    black: ['dramatic', 'elegant', 'bold'],
    white: ['clean', 'minimal', 'pure'],
    gray: ['neutral', 'sophisticated', 'modern']
  }
  
  return colorKeywordMap[colorName] || ['colorful', 'vibrant', 'bright']
}