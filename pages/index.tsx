import { useState } from "react";
import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default function Home() {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-black text-white overflow-x-hidden`}>
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-6 md:px-12 lg:px-16 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <span className="text-white font-bold text-xl font-mono">C</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Crunchbot
          </span>
        </div>
        <div className="flex space-x-6">
          <button className="text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium hover:scale-105">
            About
          </button>
          <button className="text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium hover:scale-105">
            Features
          </button>
        </div>
      </nav>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 text-center relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              Crunchbot
            </span>
            <br />
            <span className="text-white font-light">
              AI Analytics
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Your AI-powered NFT analytics assistant. 
            <span className="text-cyan-400 font-medium"> Ask anything</span>, 
            <span className="text-blue-400 font-medium"> explore various metrics</span>, and 
            <span className="text-purple-400 font-medium"> uncover insights</span> — all with real-time data from bitsCrunch.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/login">
              <button
                className={`px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-500 transform hover:scale-105 relative overflow-hidden group ${
                  isHovered === 'login'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/30'
                    : 'bg-gray-900 border-2 border-gray-700 text-cyan-400 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/20'
                }`}
                onMouseEnter={() => setIsHovered('login')}
                onMouseLeave={() => setIsHovered(null)}
              >
                <span className="relative z-10">Enter Portal</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </Link>
            <Link href="/signup">
              <button
                className={`px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-500 transform hover:scale-105 relative overflow-hidden group ${
                  isHovered === 'signup'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/30'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-purple-500/30'
                }`}
                onMouseEnter={() => setIsHovered('signup')}
                onMouseLeave={() => setIsHovered(null)}
              >
                <span className="relative z-10">Start Journey</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">Chat Interface for NFT Insights</h3>
              <p className="text-gray-400 leading-relaxed">
                Get real-time insights and analysis of NFT collections using AI chat interface
              </p>
            </div>

            <div className="group bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors duration-300">Gemini 2.0 Flash AI</h3>
              <p className="text-gray-400 leading-relaxed">
                Powered by Google&apos;s most advanced AI for unparalleled market predictions
              </p>
            </div>

            <div className="group bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors duration-300">BitsCrunch API</h3>
              <p className="text-gray-400 leading-relaxed">
                Get Real-time Analytics of 1000+ NFT collections using BitsCrunch API
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-12 mt-20 border-t border-gray-800 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg font-mono">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Crunchbot
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Next-generation blockchain analytics powered by cutting-edge AI technology
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-500">
              <span>Powered by</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">BitsCrunch API</span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">Gemini 2.0 Flash</span>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-500">
              © 2025 Crunchbot. Built with Next.js and advanced AI technologies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
