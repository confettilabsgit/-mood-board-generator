import { useState } from 'react'
import ColorPicker from './components/ColorPicker'
import StyleSelector from './components/StyleSelector'
import MoodBoard from './components/MoodBoard'

function App() {
  const [selectedColor, setSelectedColor] = useState('#ff6b6b')
  const [selectedStyle, setSelectedStyle] = useState('modern')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    // This will trigger the mood board generation
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Mood Board Generator
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4 mb-6">
            Choose a color and style to create your perfect mood board
          </p>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg transform hover:scale-105 disabled:transform-none"
          >
            {isGenerating ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Magic...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                ✨ Generate Mood Board ✨
              </span>
            )}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1 space-y-6 lg:space-y-8 order-2 lg:order-1">
            <ColorPicker 
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
            
            <StyleSelector 
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
            />
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <MoodBoard 
              color={selectedColor}
              style={selectedStyle}
              isGenerating={isGenerating}
              onGenerationComplete={() => setIsGenerating(false)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
