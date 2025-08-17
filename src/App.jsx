import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import MilanoteSidebar from './components/MilanoteSidebar'
import MilanoteCanvas from './components/MilanoteCanvas'
import { getCuratedMoodBoardImages, getSizeDimensions } from './services/enhancedImageService'
import { generateAIKeywords, generateSmartLayout } from './services/aiService'

function App() {
  const [selectedColor, setSelectedColor] = useState('#C03939') // Default red like the example
  const [selectedStyle, setSelectedStyle] = useState('modern')
  const [isGenerating, setIsGenerating] = useState(false)
  const [canvasElements, setCanvasElements] = useState([])

  const handleAutoGenerate = async () => {
    setIsGenerating(true)
    
    try {
      // Get curated images using enhanced service with Lummi integration
      const allImages = await getCuratedMoodBoardImages(selectedStyle, selectedColor, 'milanote')
      
      // Create varied layout with different sizes
      const imageElements = allImages.map((image, index) => {
        // Use size variant from enhanced service or generate one
        const sizeVariant = image.sizeVariant || getSizeVariant(index)
        const baseDimensions = getSizeDimensions(sizeVariant)
        
        // Create organic layout with varied positioning
        const position = generateVariedPosition(index, allImages.length, baseDimensions)
        
        return {
          id: `auto-image-${Date.now()}-${index}`,
          type: 'image',
          data: {
            url: image.url,
            alt: image.alt,
            // Use enhanced color analysis for better color pop detection
            isColorPop: image.isColorPop !== undefined ? image.isColorPop : (image.category === 'colorPop' || index >= 7),
            colors: image.colors || [],
            dominantColor: image.dominantColor,
            source: image.source || 'enhanced',
            contentType: image.contentType || 'object',
            sizeVariant: sizeVariant
          },
          position: position,
          size: { 
            width: baseDimensions.width + (Math.random() * 40 - 20), // Slight size variation
            height: baseDimensions.height + (Math.random() * 30 - 15)
          },
          rotation: (Math.random() - 0.5) * 8, // More varied rotation for organic feel
          zIndex: index
        }
      })

      // Add color swatches
      const colorPalette = generateColorPalette(selectedColor)
      const swatchElements = colorPalette.slice(0, 3).map((swatch, index) => ({
        id: `auto-swatch-${Date.now()}-${index}`,
        type: 'swatch',
        data: swatch,
        position: { x: 50 + index * 140, y: 50 },
        size: { width: 120, height: 100 },
        rotation: 0,
        zIndex: 100 + index
      }))

      // Add single typography example
      const typographyElement = {
        id: `auto-text-${Date.now()}`,
        type: 'text',
        data: {
          content: getStyleTypographySnippet(selectedStyle),
          fontFamily: getStyleFont(selectedStyle),
          fontSize: '16px',
          backgroundColor: 'rgba(255,255,255,0.9)'
        },
        position: { x: 50, y: 500 },
        size: { width: 200, height: 80 },
        rotation: 0,
        zIndex: 200
      }

      setCanvasElements([...imageElements, ...swatchElements, typographyElement])
      
    } catch (error) {
      console.error('Error generating mood board:', error)
    }
    
    setIsGenerating(false)
  }

  const generateColorPalette = (baseColor) => {
    const r = parseInt(baseColor.slice(1, 3), 16)
    const g = parseInt(baseColor.slice(3, 5), 16)
    const b = parseInt(baseColor.slice(5, 7), 16)
    
    return [
      { 
        hex: baseColor.toUpperCase(), 
        name: 'Primary', 
        color: baseColor 
      },
      { 
        hex: `#${Math.min(255, r + 40).toString(16).padStart(2, '0')}${Math.min(255, g + 40).toString(16).padStart(2, '0')}${Math.min(255, b + 40).toString(16).padStart(2, '0')}`.toUpperCase(), 
        name: 'Light', 
        color: `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})` 
      },
      { 
        hex: `#${Math.max(0, r - 40).toString(16).padStart(2, '0')}${Math.max(0, g - 40).toString(16).padStart(2, '0')}${Math.max(0, b - 40).toString(16).padStart(2, '0')}`.toUpperCase(), 
        name: 'Dark', 
        color: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})` 
      }
    ]
  }

  const getStyleTypographySnippet = (style) => {
    const snippets = {
      modern: 'Modern\nClean & Minimal',
      vintage: 'Vintage\nTimeless Elegance',
      bohemian: 'Bohemian\nFree Spirit',
      industrial: 'Industrial\nUrban Edge',
      nature: 'Nature\nOrganic Beauty',
      luxury: 'Luxury\nSophisticated'
    }
    return snippets[style] || snippets.modern
  }

  const getStyleFont = (style) => {
    const fonts = {
      modern: 'Inter, sans-serif',
      vintage: '"Playfair Display", serif',
      bohemian: '"Amatic SC", cursive',
      industrial: '"Roboto Condensed", sans-serif',
      nature: '"Nunito", sans-serif',
      luxury: '"Cormorant Garamond", serif'
    }
    return fonts[style] || fonts.modern
  }

  // Generate size variant for images
  const getSizeVariant = (index) => {
    const sizePattern = [
      'large', 'small', 'medium', 'wide', 'small', 
      'medium', 'tall', 'small', 'large'
    ]
    return sizePattern[index % sizePattern.length] || 'medium'
  }

  // Generate varied positions for organic layout
  const generateVariedPosition = (index, totalCount, dimensions) => {
    const canvasWidth = 1200
    const canvasHeight = 800
    const margin = 50
    
    // Create a loose grid with organic positioning
    const cols = 3
    const rows = Math.ceil(totalCount / cols)
    
    const col = index % cols
    const row = Math.floor(index / cols)
    
    const baseX = margin + col * (canvasWidth - margin * 2) / cols
    const baseY = margin + row * (canvasHeight - margin * 2) / rows
    
    // Add organic offset
    const offsetX = (Math.random() - 0.5) * 100
    const offsetY = (Math.random() - 0.5) * 80
    
    return {
      x: Math.max(margin, Math.min(canvasWidth - dimensions.width - margin, baseX + offsetX)),
      y: Math.max(margin, Math.min(canvasHeight - dimensions.height - margin, baseY + offsetY))
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-100 flex">
        <MilanoteSidebar
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
          onAutoGenerate={handleAutoGenerate}
          isGenerating={isGenerating}
        />
        
        <MilanoteCanvas
          selectedColor={selectedColor}
          selectedStyle={selectedStyle}
          elements={canvasElements}
          onElementsChange={setCanvasElements}
        />
      </div>
    </DndProvider>
  )
}

export default App
