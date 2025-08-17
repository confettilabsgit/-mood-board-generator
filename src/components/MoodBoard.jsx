import { useEffect, useRef, useState } from 'react'
import { searchImages } from '../services/unsplashApi'
import { generateAIKeywords, generateSmartLayout } from '../services/aiService'

const MoodBoard = ({ color, style, isGenerating, onGenerationComplete }) => {
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch images when style changes
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Generate AI-enhanced keywords
        const aiKeywords = generateAIKeywords(color, style)
        const fetchedImages = await searchImages(style, color, 9, aiKeywords)
        setImages(fetchedImages)
      } catch (error) {
        console.error('Failed to fetch images:', error)
      }
    }
    
    fetchImages()
  }, [style, color])

  const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const generateColorPalette = (baseColor) => {
    const r = parseInt(baseColor.slice(1, 3), 16)
    const g = parseInt(baseColor.slice(3, 5), 16)
    const b = parseInt(baseColor.slice(5, 7), 16)
    
    // Create variations of the base color
    const palette = [
      baseColor, // Original
      `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`, // Lighter
      `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`, // Darker
      `rgb(${Math.min(255, r + 20)}, ${g}, ${Math.max(0, b - 20)})`, // Variation 1
      '#ffffff', // White
      '#000000'  // Black
    ]
    
    return palette
  }

  const addColorSwatches = (ctx, color, canvasWidth, canvasHeight, style) => {
    const palette = generateColorPalette(color)
    const swatchSize = 60
    const spacing = 10
    
    // Position swatches in available space
    const startX = canvasWidth - (palette.length * (swatchSize + spacing)) - 30
    const startY = 30
    
    palette.forEach((swatchColor, index) => {
      const x = startX + index * (swatchSize + spacing)
      const y = startY
      
      // Draw swatch with shadow
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      ctx.fillStyle = swatchColor
      ctx.fillRect(x, y, swatchSize, swatchSize)
      
      // Add white border for contrast
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, swatchSize, swatchSize)
      
      ctx.restore()
    })
    
    // Add vertical color strip
    const stripWidth = 20
    const stripHeight = 200
    const stripX = 30
    const stripY = canvasHeight - stripHeight - 30
    
    // Create gradient strip
    const gradient = ctx.createLinearGradient(stripX, stripY, stripX, stripY + stripHeight)
    gradient.addColorStop(0, color)
    gradient.addColorStop(0.5, hexToRgba(color, 0.7))
    gradient.addColorStop(1, hexToRgba(color, 0.3))
    
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 8
    ctx.fillStyle = gradient
    ctx.fillRect(stripX, stripY, stripWidth, stripHeight)
    ctx.restore()
  }

  const addDesignElements = (ctx, color, canvasWidth, canvasHeight, style) => {
    // Add subtle geometric shapes in empty spaces only (not overlapping photos)
    ctx.save()
    
    if (style === 'modern') {
      // Minimal lines at edges
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(20, canvasHeight - 20)
      ctx.lineTo(120, canvasHeight - 20)
      ctx.stroke()
      
    } else if (style === 'vintage') {
      // Small decorative corner element
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.setLineDash([5, 3])
      ctx.strokeRect(canvasWidth - 80, canvasHeight - 80, 60, 60)
      ctx.setLineDash([])
      
    } else if (style === 'bohemian') {
      // Small mandala in corner
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      const centerX = canvasWidth - 50
      const centerY = canvasHeight - 50
      
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        ctx.beginPath()
        ctx.arc(centerX + Math.cos(angle) * 15, centerY + Math.sin(angle) * 15, 5, 0, Math.PI * 2)
        ctx.stroke()
      }
      
    } else if (style === 'industrial') {
      // Simple angular line
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(canvasWidth - 100, canvasHeight - 30)
      ctx.lineTo(canvasWidth - 30, canvasHeight - 30)
      ctx.lineTo(canvasWidth - 30, canvasHeight - 60)
      ctx.stroke()
      
    } else if (style === 'nature') {
      // Organic flowing line at bottom
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(20, canvasHeight - 40)
      ctx.quadraticCurveTo(80, canvasHeight - 60, 140, canvasHeight - 40)
      ctx.stroke()
      
    } else if (style === 'luxury') {
      // Elegant corner accent
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(canvasWidth - 40, canvasHeight - 40, 20, 0, Math.PI * 2)
      ctx.stroke()
    }
    
    ctx.restore()
  }

  const generateMoodBoard = async () => {
    if (!canvasRef.current) return

    setIsLoading(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add subtle background gradient with selected color
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, hexToRgba(color, 0.1))
    gradient.addColorStop(1, hexToRgba(color, 0.05))
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Generate AI-powered smart layout
    const smartLayouts = generateSmartLayout(images.length, canvas.width, canvas.height, style)

    // Load and draw images with AI-enhanced overlays
    const loadPromises = images.slice(0, Math.min(6, smartLayouts.length)).map((imageData, index) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const layout = smartLayouts[index]
          
          // Draw image first
          ctx.drawImage(img, layout.x, layout.y, layout.width, layout.height)
          
          // Convert to grayscale manually
          const imageData = ctx.getImageData(layout.x, layout.y, layout.width, layout.height)
          const data = imageData.data
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1] 
            const b = data[i + 2]
            // Convert to grayscale using luminance formula
            const gray = 0.299 * r + 0.587 * g + 0.114 * b
            data[i] = gray     // red
            data[i + 1] = gray // green
            data[i + 2] = gray // blue
            // alpha stays the same
          }
          
          ctx.putImageData(imageData, layout.x, layout.y)
          
          resolve()
        }
        img.onerror = () => {
          // Fallback: draw simple colored rectangle
          const layout = smartLayouts[index] || { x: 50, y: 50, width: 200, height: 150, rotation: 0 }
          
          ctx.fillStyle = hexToRgba(color, 0.8)
          ctx.fillRect(layout.x, layout.y, layout.width, layout.height)
          
          resolve()
        }
        img.src = imageData.url
      })
    })

    try {
      await Promise.all(loadPromises)
      
      // Add color swatches
      addColorSwatches(ctx, color, canvas.width, canvas.height, style)
      
      // Add design elements and textures
      addDesignElements(ctx, color, canvas.width, canvas.height, style)

    } catch (error) {
      console.error('Error loading images:', error)
    }

    setIsLoading(false)
    onGenerationComplete()
  }

  useEffect(() => {
    if (isGenerating) {
      generateMoodBoard()
    }
  }, [isGenerating, color, style])

  const downloadMoodBoard = () => {
    if (!canvasRef.current) return
    
    const link = document.createElement('a')
    link.download = `moodboard-${style}-${color.slice(1)}.png`
    link.href = canvasRef.current.toDataURL('image/png', 1.0)
    link.click()
  }

  const shareMoodBoard = async () => {
    if (!canvasRef.current) return

    try {
      const canvas = canvasRef.current
      canvas.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `moodboard-${style}-${color.slice(1)}.png`, {
            type: 'image/png'
          })
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'My Mood Board',
              text: `Check out this ${style} mood board in ${color}!`,
              files: [file]
            })
          } else {
            // Fallback to copying image URL
            copyToClipboard()
          }
        } else {
          // Fallback for browsers without Web Share API
          copyToClipboard()
        }
      }, 'image/png', 1.0)
    } catch (error) {
      console.error('Error sharing mood board:', error)
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    if (!canvasRef.current) return
    
    const dataURL = canvasRef.current.toDataURL('image/png', 1.0)
    navigator.clipboard.writeText(dataURL).then(() => {
      alert('Mood board copied to clipboard!')
    }).catch(() => {
      alert('Unable to copy. Please use the download button instead.')
    })
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Mood Board</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={shareMoodBoard}
            disabled={isLoading || isGenerating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={downloadMoodBoard}
            disabled={isLoading || isGenerating}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-auto border border-gray-200 rounded-lg shadow-sm"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {(isLoading || isGenerating) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Creating your mood board...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Style: <span className="font-semibold capitalize">{style}</span></p>
        <p>Color: <span className="font-semibold">{color.toUpperCase()}</span></p>
      </div>
    </div>
  )
}

export default MoodBoard