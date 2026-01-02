'use client';

import { useState, useEffect } from 'react';
import { Music, Film, Tv, Image, Upload, Play, Pause, Download, Folder, Search, RefreshCw } from 'lucide-react';

interface Asset {
  name: string;
  id: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
}

interface AssetFolder {
  name: string;
  count: number;
  items: Asset[];
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload' | 'process'>('browse');
  const [assets, setAssets] = useState<AssetFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assets/list');
      const data = await response.json();
      setAssets(data.folders || []);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
    setLoading(false);
  };

  const playAudio = (url: string) => {
    if (playingAudio === url) {
      setPlayingAudio(null);
      return;
    }
    setPlayingAudio(url);
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => setPlayingAudio(null);
  };

  const getAssetUrl = (folder: string, name: string) => {
    return `${SUPABASE_URL}/storage/v1/object/public/game-assets/${folder}/${name}`;
  };

  const filteredAssets = assets.map(folder => ({
    ...folder,
    items: folder.items.filter(item => 
      !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(folder => !selectedFolder || folder.name === selectedFolder);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-xl">🎨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Javari Asset Processor</h1>
                <p className="text-sm text-gray-400">Universal Media Parser for CR AudioViz AI</p>
              </div>
            </div>
            <button
              onClick={loadAssets}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-black/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'browse', label: 'Browse Assets', icon: Folder },
              { id: 'upload', label: 'Upload', icon: Upload },
              { id: 'process', label: 'Process Media', icon: Film },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">All Categories</option>
                {assets.map(folder => (
                  <option key={folder.name} value={folder.name}>
                    {folder.name} ({folder.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Image className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {assets.filter(f => f.name.includes('sprites') || f.name.includes('ui')).reduce((a, b) => a + b.count, 0)}
                    </p>
                    <p className="text-sm text-gray-400">Sprites & UI</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Music className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {assets.find(f => f.name === 'sounds')?.count || 0}
                    </p>
                    <p className="text-sm text-gray-400">Sounds</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {assets.find(f => f.name === 'backgrounds')?.count || 0}
                    </p>
                    <p className="text-sm text-gray-400">Backgrounds</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Film className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {assets.reduce((a, b) => a + b.count, 0)}
                    </p>
                    <p className="text-sm text-gray-400">Total Assets</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                {filteredAssets.map(folder => (
                  folder.items.length > 0 && (
                    <div key={folder.name} className="space-y-4">
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Folder className="w-5 h-5 text-purple-400" />
                        {folder.name}
                        <span className="text-sm font-normal text-gray-400">
                          ({folder.items.length} items)
                        </span>
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {folder.items.map(item => {
                          const url = getAssetUrl(folder.name, item.name);
                          const isAudio = item.name.endsWith('.wav') || item.name.endsWith('.mp3') || item.name.endsWith('.ogg');
                          const isImage = item.name.endsWith('.png') || item.name.endsWith('.jpg');
                          
                          return (
                            <div
                              key={item.id || item.name}
                              className="bg-white/5 rounded-lg border border-white/10 overflow-hidden hover:border-purple-500/50 transition group"
                            >
                              {isImage ? (
                                <div className="aspect-square bg-black/20 flex items-center justify-center p-2">
                                  <img
                                    src={url}
                                    alt={item.name}
                                    className="max-w-full max-h-full object-contain image-pixelated"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                              ) : isAudio ? (
                                <button
                                  onClick={() => playAudio(url)}
                                  className="aspect-square w-full bg-black/20 flex items-center justify-center hover:bg-purple-500/20 transition"
                                >
                                  {playingAudio === url ? (
                                    <Pause className="w-8 h-8 text-purple-400" />
                                  ) : (
                                    <Play className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
                                  )}
                                </button>
                              ) : (
                                <div className="aspect-square bg-black/20 flex items-center justify-center">
                                  <Folder className="w-8 h-8 text-gray-500" />
                                </div>
                              )}
                              <div className="p-2">
                                <p className="text-xs text-gray-400 truncate" title={item.name}>
                                  {item.name}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 rounded-xl border border-white/10 p-8">
              <div className="text-center">
                <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Upload Assets</h2>
                <p className="text-gray-400 mb-6">
                  Drag and drop files here or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,audio/*,video/*"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white cursor-pointer transition"
                >
                  <Upload className="w-5 h-5" />
                  Select Files
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'process' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-400" />
                Plex Media Processing
              </h2>
              <p className="text-gray-400 mb-6">
                Extract audio clips, dialogue, and sound effects from your Plex library.
                This requires running the local extraction agent on your server.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <button className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/50 transition">
                  <Film className="w-10 h-10 text-blue-400" />
                  <span className="text-white font-medium">Movies</span>
                  <span className="text-sm text-gray-400">Extract scores & dialogue</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/50 transition">
                  <Tv className="w-10 h-10 text-green-400" />
                  <span className="text-white font-medium">TV Shows</span>
                  <span className="text-sm text-gray-400">Process episodes</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/50 transition">
                  <Music className="w-10 h-10 text-purple-400" />
                  <span className="text-white font-medium">Music</span>
                  <span className="text-sm text-gray-400">Extract stems & metadata</span>
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>Note:</strong> To process your Plex library, run the extraction agent on your Ubuntu server:
                </p>
                <code className="block mt-2 p-3 bg-black/30 rounded text-green-400 text-sm overflow-x-auto">
                  python3 javari_media_parser.py --mode full
                </code>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-gray-500 text-sm">
            CR AudioViz AI, LLC • Your Story. Our Design. ™
          </p>
        </div>
      </footer>
    </div>
  );
}
