import { searchImages as searchUnsplash } from './unsplashApi'
import { 
  searchLummiImages, 
  searchByDominantColor, 
  getCuratedColorCollection,
  categorizeImagesByColor 
} from './lummiApi'
import { generateAIKeywords } from './aiService'

// Enhanced image search that combines Unsplash and Lummi
export const searchEnhancedImages = async (style, color, totalCount = 9, mode = 'mixed') => {
  try {
    let allImages = []

    if (mode === 'mixed' || mode === 'lummi') {
      // Get images from Lummi with color analysis
      const lummiCount = mode === 'lummi' ? totalCount : Math.ceil(totalCount * 0.6)
      const lummiImages = await searchLummiImages(style, color, lummiCount)
      allImages = [...allImages, ...lummiImages]
    }

    if (mode === 'mixed' || mode === 'unsplash') {
      // Fill remaining with Unsplash images
      const unsplashCount = mode === 'unsplash' ? totalCount : Math.max(3, totalCount - allImages.length)
      const aiKeywords = generateAIKeywords(color, style)
      const unsplashImages = await searchUnsplash(style, color, unsplashCount, aiKeywords)
      
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
    // Fallback to Unsplash only
    const aiKeywords = generateAIKeywords(color, style)
    return await searchUnsplash(style, color, totalCount, aiKeywords)
  }
}

// Smart mood board image curation
export const getCuratedMoodBoardImages = async (style, color, layout = 'milanote') => {
  try {
    const totalImages = Math.max(7, layout === 'milanote' ? 9 : 12) // Minimum 7 images

    // Strategy: Much more diverse content mix
    const searchStrategies = [
      // People & Fashion - More images
      { terms: ['portrait', 'people', 'fashion', 'model'], count: 3 },
      // Nature & Objects  
      { terms: ['nature', 'flower', 'landscape', 'food'], count: 2 },
      // Art & Design
      { terms: ['art', 'illustration', 'graphic design', 'painting'], count: 2 },
      // Architecture (but specific)
      { terms: ['building', 'architecture', 'street', 'urban'], count: 1 },
      // Typography & Text
      { terms: ['typography', 'sign', 'text', 'lettering'], count: 1 },
      // Lifestyle & Objects
      { terms: ['lifestyle', 'product', 'texture', 'abstract'], count: 1 }
    ]

    const [diverseImages] = await Promise.all([
      // Get truly diverse content
      Promise.all(searchStrategies.map(async (strategy) => {
        const searchTerm = `${strategy.terms[Math.floor(Math.random() * strategy.terms.length)]} ${style}`
        return await searchEnhancedImages(searchTerm, color, strategy.count, 'unsplash')
      })).then(results => results.flat().slice(0, totalImages))
    ])

    // Use the diverse images directly
    const allImages = diverseImages

    // If we don't have enough images, supplement with additional searches
    if (allImages.length < totalImages) {
      const additionalSearches = [
        'creative ' + style,
        'artistic ' + style, 
        'beautiful ' + style
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
    // Fallback to basic enhanced search
    return await searchEnhancedImages(style, color, totalImages, 'mixed')
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