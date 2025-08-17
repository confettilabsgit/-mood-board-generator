import React, { useState, useRef, useCallback } from 'react'
import { useDrop } from 'react-dnd'

const MilanoteCanvas = ({ selectedColor, selectedStyle, elements, onElementsChange }) => {
  const canvasRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [selectedElements, setSelectedElements] = useState([])

  const [{ isOver }, drop] = useDrop({
    accept: ['image', 'swatch', 'text'],
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset()
      const canvasRect = canvasRef.current.getBoundingClientRect()
      
      const x = (offset.x - canvasRect.left - panOffset.x) / scale
      const y = (offset.y - canvasRect.top - panOffset.y) / scale
      
      const newElement = {
        id: Date.now(),
        type: item.type,
        data: item.data,
        position: { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 }, // Snap to 20px grid
        size: item.defaultSize || { width: 200, height: 150 },
        rotation: 0,
        zIndex: elements.length
      }
      
      onElementsChange([...elements, newElement])
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  })

  const handleElementSelect = (elementId, multiSelect = false) => {
    if (multiSelect) {
      setSelectedElements(prev => 
        prev.includes(elementId) 
          ? prev.filter(id => id !== elementId)
          : [...prev, elementId]
      )
    } else {
      setSelectedElements([elementId])
    }
  }

  const handleElementMove = (elementId, newPosition) => {
    // Snap to grid
    const snappedPosition = {
      x: Math.round(newPosition.x / 20) * 20,
      y: Math.round(newPosition.y / 20) * 20
    }
    
    onElementsChange(elements.map(el => 
      el.id === elementId 
        ? { ...el, position: snappedPosition }
        : el
    ))
  }

  const handleElementResize = (elementId, newSize) => {
    // Snap size to grid
    const snappedSize = {
      width: Math.round(newSize.width / 20) * 20,
      height: Math.round(newSize.height / 20) * 20
    }
    
    onElementsChange(elements.map(el => 
      el.id === elementId 
        ? { ...el, size: snappedSize }
        : el
    ))
  }

  const handleZoom = (delta) => {
    setScale(prev => Math.max(0.25, Math.min(3, prev + delta)))
  }

  return (
    <div className="flex-1 bg-gray-50 relative overflow-hidden">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => handleZoom(0.1)}
          className="bg-white border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
        >
          +
        </button>
        <span className="bg-white border border-gray-300 rounded px-3 py-1 text-sm">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => handleZoom(-0.1)}
          className="bg-white border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50"
        >
          -
        </button>
      </div>

      {/* Grid Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
        }}
      />

      {/* Canvas */}
      <div
        ref={(node) => {
          canvasRef.current = node
          drop(node)
        }}
        className={`w-full h-full relative ${isOver ? 'bg-blue-50' : ''}`}
        style={{
          transform: `scale(${scale}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: '0 0'
        }}
      >
        {/* Render Elements */}
        {elements.map(element => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElements.includes(element.id)}
            onSelect={handleElementSelect}
            onMove={handleElementMove}
            onResize={handleElementResize}
            selectedColor={selectedColor}
            selectedStyle={selectedStyle}
          />
        ))}

        {/* Drop Zone Indicator */}
        {isOver && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-20 pointer-events-none" />
        )}
      </div>
    </div>
  )
}

const CanvasElement = ({ element, isSelected, onSelect, onMove, onResize, selectedColor, selectedStyle }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle')) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y
    })
    onSelect(element.id, e.ctrlKey || e.metaKey)
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }
    onMove(element.id, newPosition)
  }, [isDragging, dragStart, element.id, onMove])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove])

  const renderElementContent = () => {
    switch (element.type) {
      case 'image':
        return (
          <img
            src={element.data.url}
            alt={element.data.alt || 'Mood board image'}
            className="w-full h-full object-cover"
            style={{ 
              filter: element.data.isColorPop ? 'none' : 'grayscale(100%)',
              borderRadius: '8px'
            }}
            draggable={false}
          />
        )
      
      case 'swatch':
        return (
          <div className="w-full h-full flex flex-col">
            <div 
              className="flex-1"
              style={{ backgroundColor: element.data.color }}
            />
            <div className="bg-white p-2 text-xs">
              <div className="font-medium">{element.data.name}</div>
              <div className="text-gray-500">{element.data.hex}</div>
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div 
            className="w-full h-full p-4 text-black"
            style={{ 
              fontFamily: element.data.fontFamily || 'Inter',
              fontSize: element.data.fontSize || '16px',
              backgroundColor: element.data.backgroundColor || 'transparent'
            }}
          >
            {element.data.content}
          </div>
        )
      
      default:
        return <div className="w-full h-full bg-gray-200" />
    }
  }

  return (
    <div
      className={`absolute cursor-move border-2 ${
        isSelected ? 'border-blue-500' : 'border-transparent'
      } hover:border-gray-300`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex
      }}
      onMouseDown={handleMouseDown}
    >
      {renderElementContent()}
      
      {/* Selection Handles */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white resize-handle cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white resize-handle cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white resize-handle cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white resize-handle cursor-se-resize" />
        </>
      )}
    </div>
  )
}

export default MilanoteCanvas