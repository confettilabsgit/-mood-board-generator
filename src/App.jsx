import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import MilanoteSidebar from './components/MilanoteSidebar'
import MilanoteCanvas from './components/MilanoteCanvas'
import { searchImages } from './services/unsplashApi'
import { generateAIKeywords, generateSmartLayout } from './services/aiService'

function App() {
  const [selectedColor, setSelectedColor] = useState('#C03939') // Default red like the example
  const [selectedStyle, setSelectedStyle] = useState('modern')
  const [isGenerating, setIsGenerating] = useState(false)
  const [canvasElements, setCanvasElements] = useState([])

  const handleAutoGenerate = async () => {
    setIsGenerating(true)
    
    try {
      // Fetch a mix of images: B&W, neutral, and color-pop images
      const [bwImages, neutralImages, colorImages] = await Promise.all([
        searchImages(selectedStyle, selectedColor, 4, ['black white', 'monochrome', 'minimal']),
        searchImages(selectedStyle, selectedColor, 3, ['neutral', 'beige', 'minimal', 'clean']),
        searchImages(selectedStyle, selectedColor, 2, generateAIKeywords(selectedColor, selectedStyle))
      ])

      // Combine and shuffle images
      const allImages = [...bwImages, ...neutralImages, ...colorImages]
      
      // Generate smart layout positions
      const layouts = generateSmartLayout(allImages.length, 1200, 800, selectedStyle)
      
      // Create canvas elements
      const imageElements = allImages.map((image, index) => {
        const layout = layouts[index] || { x: 100 + (index % 3) * 220, y: 100 + Math.floor(index / 3) * 180, width: 200, height: 150 }
        
        return {
          id: `auto-image-${Date.now()}-${index}`,
          type: 'image',
          data: {
            url: image.url,
            alt: image.alt,
            // Apply color pop only to designated color images
            isColorPop: index >= 7, // Last 2 images get color treatment
          },
          position: { x: layout.x, y: layout.y },
          size: { 
            width: layout.width + (Math.random() * 80 - 40), // Vary sizes slightly
            height: layout.height + (Math.random() * 60 - 30)
          },
          rotation: (Math.random() - 0.5) * 6, // Slight rotation for organic feel
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

      // Add typography example
      const typographyElement = {
        id: `auto-text-${Date.now()}`,
        type: 'text',
        data: {
          content: getStyleThemeText(selectedStyle),
          fontFamily: getStyleFont(selectedStyle),
          fontSize: '18px',
          backgroundColor: 'rgba(255,255,255,0.9)'
        },
        position: { x: 800, y: 100 },
        size: { width: 250, height: 150 },
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

  const getStyleThemeText = (style) => {
    const themes = {
      modern: 'THEMES\n• Minimalism\n• Clean lines\n• Functionality\n• Simplicity',
      vintage: 'THEMES\n• Nostalgia\n• Heritage\n• Craftsmanship\n• Timeless',
      bohemian: 'THEMES\n• Freedom\n• Creativity\n• Wanderlust\n• Artistry',
      industrial: 'THEMES\n• Raw materials\n• Urban edge\n• Functionality\n• Structure',
      nature: 'THEMES\n• Organic forms\n• Earth tones\n• Sustainability\n• Growth',
      luxury: 'THEMES\n• Elegance\n• Sophistication\n• Premium quality\n• Exclusivity'
    }
    return themes[style] || themes.modern
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
