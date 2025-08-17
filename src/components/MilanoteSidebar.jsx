import React, { useState } from 'react'
import { useDrag } from 'react-dnd'
import ColorPicker from './ColorPicker'
import StyleSelector from './StyleSelector'

const MilanoteSidebar = ({ 
  selectedColor, 
  onColorChange, 
  selectedStyle, 
  onStyleChange,
  onAutoGenerate,
  isGenerating 
}) => {
  const [activeTab, setActiveTab] = useState('tools')

  const generateColorPalette = (baseColor) => {
    const r = parseInt(baseColor.slice(1, 3), 16)
    const g = parseInt(baseColor.slice(3, 5), 16)
    const b = parseInt(baseColor.slice(5, 7), 16)
    
    const colorNames = ['Primary', 'Light', 'Dark', 'Accent', 'Neutral']
    
    return [
      { hex: baseColor, name: colorNames[0], color: baseColor },
      { hex: `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`, name: colorNames[1], color: `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})` },
      { hex: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`, name: colorNames[2], color: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})` },
      { hex: '#ffffff', name: 'White', color: '#ffffff' },
      { hex: '#000000', name: 'Black', color: '#000000' }
    ]
  }

  const getTypographyForStyle = (style) => {
    const typography = {
      modern: {
        primary: { name: 'Inter', family: 'Inter, sans-serif', weight: '600' },
        secondary: { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', weight: '400' },
        accent: { name: 'Futura', family: 'Futura, sans-serif', weight: '300' }
      },
      vintage: {
        primary: { name: 'Playfair Display', family: '"Playfair Display", serif', weight: '700' },
        secondary: { name: 'Merriweather', family: '"Merriweather", serif', weight: '400' },
        accent: { name: 'Old Standard TT', family: '"Old Standard TT", serif', weight: '400' }
      },
      bohemian: {
        primary: { name: 'Amatic SC', family: '"Amatic SC", cursive', weight: '700' },
        secondary: { name: 'Indie Flower', family: '"Indie Flower", cursive', weight: '400' },
        accent: { name: 'Dancing Script', family: '"Dancing Script", cursive', weight: '600' }
      },
      industrial: {
        primary: { name: 'Roboto Condensed', family: '"Roboto Condensed", sans-serif', weight: '700' },
        secondary: { name: 'Oswald', family: '"Oswald", sans-serif', weight: '500' },
        accent: { name: 'Source Code Pro', family: '"Source Code Pro", monospace', weight: '400' }
      },
      nature: {
        primary: { name: 'Nunito', family: '"Nunito", sans-serif', weight: '600' },
        secondary: { name: 'Source Sans Pro', family: '"Source Sans Pro", sans-serif', weight: '400' },
        accent: { name: 'Satisfy', family: '"Satisfy", cursive', weight: '400' }
      },
      luxury: {
        primary: { name: 'Cormorant Garamond', family: '"Cormorant Garamond", serif', weight: '600' },
        secondary: { name: 'Crimson Text', family: '"Crimson Text", serif', weight: '400' },
        accent: { name: 'Cinzel', family: '"Cinzel", serif', weight: '500' }
      }
    }
    
    return typography[style] || typography.modern
  }

  const tabs = [
    { id: 'tools', name: 'Tools', icon: '🎨' },
    { id: 'elements', name: 'Elements', icon: '📦' },
    { id: 'images', name: 'Images', icon: '🖼️' }
  ]

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
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
            <ColorPicker 
              selectedColor={selectedColor}
              onColorChange={onColorChange}
            />
            
            <StyleSelector 
              selectedStyle={selectedStyle}
              onStyleChange={onStyleChange}
            />
          </div>
        )}

        {activeTab === 'elements' && (
          <div className="p-6 space-y-6">
            {/* Color Swatches */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Color Swatches</h3>
              <div className="grid grid-cols-2 gap-2">
                {generateColorPalette(selectedColor).map((swatch, index) => (
                  <DraggableColorSwatch key={index} swatch={swatch} />
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Typography</h3>
              <div className="space-y-2">
                {Object.entries(getTypographyForStyle(selectedStyle)).map(([type, font]) => (
                  <DraggableTypography key={type} font={font} type={type} />
                ))}
              </div>
            </div>

            {/* Text Elements */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Text Elements</h3>
              <div className="space-y-2">
                <DraggableText content="TITLE TEXT" fontSize="24px" />
                <DraggableText content="Subtitle text" fontSize="18px" />
                <DraggableText content="Body text content goes here" fontSize="14px" />
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

const DraggableTypography = ({ font, type }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'text',
    item: {
      type: 'text',
      data: {
        content: font.name,
        fontFamily: font.family,
        fontSize: type === 'primary' ? '24px' : type === 'secondary' ? '18px' : '16px',
        fontWeight: font.weight
      },
      defaultSize: { width: 200, height: 60 }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  return (
    <div
      ref={drag}
      className={`p-3 border border-gray-200 rounded cursor-move hover:bg-gray-50 ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ fontFamily: font.family, fontWeight: font.weight }}
    >
      <div className="text-sm">{font.name}</div>
      <div className="text-xs text-gray-500 capitalize">{type}</div>
    </div>
  )
}

const DraggableText = ({ content, fontSize }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'text',
    item: {
      type: 'text',
      data: {
        content,
        fontSize,
        fontFamily: 'Inter, sans-serif'
      },
      defaultSize: { width: 200, height: 40 }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  return (
    <div
      ref={drag}
      className={`p-2 border border-gray-200 rounded cursor-move hover:bg-gray-50 ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ fontSize }}
    >
      {content}
    </div>
  )
}

const ImageLibrary = ({ selectedStyle, selectedColor }) => {
  // This would integrate with your existing Unsplash API
  const sampleImages = [
    { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', alt: 'Modern architecture' },
    { url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400', alt: 'Clean interior' },
    { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400', alt: 'Minimalist design' }
  ]

  return (
    <div className="grid grid-cols-1 gap-3">
      {sampleImages.map((image, index) => (
        <DraggableImage key={index} image={image} />
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
      className={`cursor-move border border-gray-200 rounded overflow-hidden hover:border-gray-300 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <img
        src={image.url}
        alt={image.alt}
        className="w-full h-24 object-cover"
        style={{ filter: 'grayscale(100%)' }}
      />
    </div>
  )
}

export default MilanoteSidebar