import React from 'react';
import { Bookmark, Share2, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Article } from '../types';

interface NewsCardProps {
  article: Article;
  onToggleRead: (id: string) => void;
  onToggleSave: (id: string) => void;
  onShare: (id: string) => void;
}

export function NewsCard({ article, onToggleRead, onToggleSave, onShare }: NewsCardProps) {
  const sentimentIcon = {
    positive: <TrendingUp className="w-5 h-5 text-green-500" />,
    negative: <TrendingDown className="w-5 h-5 text-red-500" />,
    neutral: <Minus className="w-5 h-5 text-gray-500" />
  }[article.sentiment];
  
  // Category badge colors
  const categoryColors = {
    Technology: "bg-purple-100 text-purple-800",
    Finance: "bg-green-100 text-green-800",
    Health: "bg-blue-100 text-blue-800"
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 transition-all ${
      article.isRead ? 'opacity-75' : ''
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{article.title}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              categoryColors[article.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"
            }`}>
              {article.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sentimentIcon}
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">{article.summary}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>{article.source}</span>
          <span>{article.date}</span>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => onToggleRead(article.id)}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              article.isRead ? 'text-blue-500' : 'text-gray-400'
            }`}
            title="Mark as read"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onToggleSave(article.id)}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              article.isSaved ? 'text-yellow-500' : 'text-gray-400'
            }`}
            title="Save article"
          >
            <Bookmark className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onShare(article.id)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
            title="Share article"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}