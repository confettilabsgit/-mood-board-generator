const StyleSelector = ({ selectedStyle, onStyleChange }) => {
  const styles = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean lines, minimalist aesthetic',
      keywords: ['minimal', 'clean', 'geometric', 'contemporary'],
      preview: '🏢'
    },
    {
      id: 'vintage',
      name: 'Vintage',
      description: 'Retro vibes, nostalgic elements',
      keywords: ['retro', 'vintage', 'classic', 'antique'],
      preview: '📻'
    },
    {
      id: 'bohemian',
      name: 'Bohemian',
      description: 'Free-spirited, eclectic mix',
      keywords: ['boho', 'eclectic', 'artistic', 'creative'],
      preview: '🌺'
    },
    {
      id: 'industrial',
      name: 'Industrial',
      description: 'Raw materials, urban edge',
      keywords: ['industrial', 'urban', 'concrete', 'metal'],
      preview: '🏗️'
    },
    {
      id: 'nature',
      name: 'Nature',
      description: 'Organic forms, natural textures',
      keywords: ['nature', 'organic', 'botanical', 'natural'],
      preview: '🌿'
    },
    {
      id: 'luxury',
      name: 'Luxury',
      description: 'Elegant, sophisticated elements',
      keywords: ['luxury', 'elegant', 'sophisticated', 'premium'],
      preview: '💎'
    }
  ]

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Style</h3>
      
      <div className="space-y-3">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
              selectedStyle === style.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{style.preview}</span>
                  <h4 className="font-semibold text-gray-800">{style.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{style.description}</p>
                <div className="flex flex-wrap gap-1">
                  {style.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              {selectedStyle === style.id && (
                <div className="text-blue-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default StyleSelector