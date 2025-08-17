import React, { useState, useEffect, useMemo } from 'react'
import { useDrag } from 'react-dnd'
// import CanvaColorPicker from './CanvaColorPicker'
import StyleSelector from './StyleSelector'
import { getColorThemedCollection } from '../services/enhancedImageService'

const MilanoteSidebar = ({ 
  selectedColor, 
  onColorChange, 
  selectedStyle, 
  onStyleChange,
  onAutoGenerate,
  isGenerating 
}) => {
  const [activeTab, setActiveTab] = useState('tools')

  // Memoized color palette to prevent re-generation
  const colorPalette = useMemo(() => {
    const r = parseInt(selectedColor.slice(1, 3), 16)
    const g = parseInt(selectedColor.slice(3, 5), 16)
    const b = parseInt(selectedColor.slice(5, 7), 16)
    
    const colorNames = ['Primary', 'Light', 'Dark', 'Accent', 'Neutral']
    
    return [
      { hex: selectedColor, name: colorNames[0], color: selectedColor },
      { hex: `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`, name: colorNames[1], color: `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})` },
      { hex: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`, name: colorNames[2], color: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})` },
      { hex: '#ffffff', name: 'White', color: '#ffffff' },
      { hex: '#000000', name: 'Black', color: '#000000' }
    ]
  }, [selectedColor])

  const tabs = [
    { id: 'tools', name: 'Tools & Elements', icon: '🎨' },
    { id: 'images', name: 'Images', icon: '🖼️' }
  ]

  return (
    <div className="w-1/4 min-w-64 max-w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Mood Board</h1>
        <button
          onClick={onAutoGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all"
        >
          {isGenerating ? '✨ Generating...' : '🪄 Auto Generate'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'tools' && (
          <div className="p-6 space-y-6">
            {/* Color Picker */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Pick a color</h3>
              <div className="space-y-3">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => {
                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                      onColorChange(e.target.value)
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            {/* Style Selector */}
            <StyleSelector 
              selectedStyle={selectedStyle}
              onStyleChange={onStyleChange}
            />

            {/* Color Swatches */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Color Swatches</h3>
              <div className="grid grid-cols-2 gap-2">
                {colorPalette.map((swatch, index) => (
                  <DraggableColorSwatch key={`${swatch.hex}-${index}`} swatch={swatch} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Stock Images</h3>
            <p className="text-sm text-gray-500 mb-4">Drag images to canvas</p>
            <ImageLibrary selectedStyle={selectedStyle} selectedColor={selectedColor} />
          </div>
        )}
      </div>
    </div>
  )
}

// Draggable Components
const DraggableColorSwatch = ({ swatch }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'swatch',
    item: {
      type: 'swatch',
      data: swatch,
      defaultSize: { width: 120, height: 80 }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  return (
    <div
      ref={drag}
      className={`cursor-move border border-gray-200 rounded overflow-hidden ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div 
        className="h-12"
        style={{ backgroundColor: swatch.color }}
      />
      <div className="p-2 bg-white">
        <div className="text-xs font-medium">{swatch.name}</div>
        <div className="text-xs text-gray-500">{swatch.hex}</div>
      </div>
    </div>
  )
}


const ImageLibrary = ({ selectedStyle, selectedColor }) => {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true)
      try {
        const themeImages = await getColorThemedCollection(selectedColor, selectedStyle, 6)
        setImages(themeImages)
      } catch (error) {
        console.error('Error fetching themed images:', error)
        // Fallback to sample images
        setImages([
          { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', alt: 'Modern architecture' },
          { url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400', alt: 'Clean interior' },
          { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400', alt: 'Minimalist design' }
        ])
      }
      setIsLoading(false)
    }

    fetchImages()
  }, [selectedStyle, selectedColor])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {images.map((image, index) => (
        <DraggableImage key={`${image.id || index}`} image={image} />
      ))}
    </div>
  )
}

const DraggableImage = ({ image }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: {
      type: 'image',
      data: image,
      defaultSize: { width: 200, height: 150 }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  return (
    <div
      ref={drag}
      className={`cursor-move border border-gray-200 rounded overflow-hidden hover:border-gray-300 relative ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <img
        src={image.url}
        alt={image.alt}
        className="w-full h-24 object-cover"
        style={{ 
          filter: image.isColorPop === false ? 'grayscale(100%)' : 'none',
          borderRadius: '4px'
        }}
      />
      {image.source === 'lummi' && (
        <div className="absolute top-1 right-1 bg-purple-500 text-white text-xs px-1 py-0.5 rounded">
          L
        </div>
      )}
    </div>
  )
}

export default MilanoteSidebar