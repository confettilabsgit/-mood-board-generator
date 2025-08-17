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
    const totalImages = layout === 'milanote' ? 9 : 12

    // Strategy: Mix of B&W, neutral, and color-pop images using both APIs
    const [lummiColorPop, lummiNeutral, unsplashBW] = await Promise.all([
      // Color-focused images from Lummi
      searchByDominantColor(color, style, 3),
      
      // Neutral/muted images from Lummi  
      searchLummiImages(style, '#f5f5f5', 3, ['neutral', 'minimal', 'clean']),
      
      // B&W images from Unsplash
      searchUnsplash(style, color, 3, ['black white', 'monochrome', 'minimal'])
    ])

    // Categorize and enhance all images
    const allImages = [...lummiColorPop, ...lummiNeutral, ...unsplashBW]
    const categorized = categorizeImagesByColor(allImages, color)

    // Create the final curated mix
    const curatedImages = [
      ...categorized.blackWhite.slice(0, 4),  // 4 B&W images
      ...categorized.neutral.slice(0, 3),     // 3 neutral images  
      ...categorized.colorPop.slice(0, 2)     // 2 color-pop images
    ]

    // Fill any gaps with mixed search
    if (curatedImages.length < totalImages) {
      const additionalImages = await searchEnhancedImages(
        style, 
        color, 
        totalImages - curatedImages.length, 
        'mixed'
      )
      curatedImages.push(...additionalImages)
    }

    return shuffleArray(curatedImages).slice(0, totalImages)

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