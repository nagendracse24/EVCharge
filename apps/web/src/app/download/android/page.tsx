'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DownloadAndroidPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Detect if mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Show install PWA prompt
      alert('To install EVCharge India:\n\n1. Tap the menu (⋮)\n2. Select "Add to Home Screen"\n3. Enjoy the app!')
    }
    
    // Redirect to home after 3 seconds
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }, [router])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl border border-gray-700 p-8 text-center">
        <div className="text-6xl mb-6">📱</div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Download EVCharge India
        </h1>
        
        <p className="text-gray-300 mb-8 text-lg">
          Install our Progressive Web App for the best experience!
        </p>
        
        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            How to Install (Android)
          </h2>
          
          <ol className="text-left text-gray-300 space-y-3">
            <li className="flex items-start gap-3">
              <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
              <span>Open this website in Chrome browser</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
              <span>Tap the menu icon (⋮) in the top right</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
              <span>Select "Add to Home Screen"</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
              <span>Tap "Add" - Done!</span>
            </li>
          </ol>
        </div>
        
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-6">
          <p className="text-indigo-300 text-sm">
            💡 Works offline, sends notifications, and feels like a native app!
          </p>
        </div>
        
        <button
          onClick={() => router.push('/')}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all"
        >
          Go to Web App
        </button>
        
        <p className="text-gray-500 text-sm mt-6">
          Redirecting to home page...
        </p>
      </div>
    </div>
  )
}




