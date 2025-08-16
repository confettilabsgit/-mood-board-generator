import { useEffect, useRef, useState } from 'react'
import { searchImages } from '../services/unsplashApi'

const MoodBoard = ({ color, style, isGenerating, onGenerationComplete }) => {
  const canvasRef = useRef(null)
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch images when style changes
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const fetchedImages = await searchImages(style, color, 6)
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

    // Define layout positions
    const layouts = [
      { x: 50, y: 50, width: 300, height: 200 },
      { x: 400, y: 80, width: 250, height: 150 },
      { x: 80, y: 300, width: 200, height: 250 },
      { x: 350, y: 280, width: 300, height: 180 },
      { x: 500, y: 50, width: 150, height: 200 }
    ]

    // Load and draw images with overlays
    const loadPromises = images.slice(0, 4).map((imageData, index) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const layout = layouts[index]
          
          // Draw image
          ctx.drawImage(img, layout.x, layout.y, layout.width, layout.height)
          
          // Add color overlay
          ctx.fillStyle = hexToRgba(color, 0.2)
          ctx.fillRect(layout.x, layout.y, layout.width, layout.height)
          
          // Add border
          ctx.strokeStyle = hexToRgba(color, 0.8)
          ctx.lineWidth = 3
          ctx.strokeRect(layout.x, layout.y, layout.width, layout.height)
          
          resolve()
        }
        img.onerror = () => {
          // Fallback: draw colored rectangle
          const layout = layouts[index]
          ctx.fillStyle = hexToRgba(color, 0.3)
          ctx.fillRect(layout.x, layout.y, layout.width, layout.height)
          ctx.strokeStyle = hexToRgba(color, 0.8)
          ctx.lineWidth = 3
          ctx.strokeRect(layout.x, layout.y, layout.width, layout.height)
          resolve()
        }
        img.src = imageData.url
      })
    })

    try {
      await Promise.all(loadPromises)
      
      // Add decorative elements
      ctx.fillStyle = hexToRgba(color, 0.6)
      ctx.beginPath()
      ctx.arc(700, 500, 30, 0, 2 * Math.PI)
      ctx.fill()

      ctx.fillStyle = hexToRgba(color, 0.4)
      ctx.fillRect(20, 20, 100, 20)
      
      // Add style-specific decorative elements
      if (style === 'modern') {
        ctx.fillStyle = hexToRgba(color, 0.3)
        ctx.fillRect(680, 20, 80, 80)
      } else if (style === 'vintage') {
        ctx.strokeStyle = hexToRgba(color, 0.5)
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(650, 400, 120, 120)
        ctx.setLineDash([])
      }

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