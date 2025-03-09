import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  LogOut,
  Newspaper,
  BookmarkPlus,
  Share2,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import supabase from '../lib/supabase';
import type { Article, NewsPreference } from '../types';
import { PreferencesPanel } from './PreferencesPanel';
import { NewsCard } from './NewsCard';

interface DashboardProps {
  session: any; // Session type
}

export function Dashboard({ session }: DashboardProps) {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<NewsPreference[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(session);

  useEffect(() => {
    // If session wasn't passed, get it from Supabase
    const fetchSession = async () => {
      if (!currentSession) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setCurrentSession(data.session);
        } else {
          // Not authenticated, redirect to login
          navigate('/login');
          return;
        }
      }
      
      fetchUserPreferences();
      fetchNewsArticles();
    };
    
    fetchSession();
  }, [session, navigate]);

  // Apply filters whenever preferences change
  useEffect(() => {
    filterArticles();
  }, [preferences, allArticles]);

  const fetchUserPreferences = async () => {
    if (!currentSession?.user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .maybeSingle();

      if (error) throw error;

      // Ensure preferences are always an array
      setPreferences(
        data?.preferences ?? [
          { id: '1', category: 'Technology', isEnabled: true },
          { id: '2', category: 'Health', isEnabled: false },
          { id: '3', category: 'Finance', isEnabled: true },
        ]
      );
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load preferences');
    }
  };

  const fetchNewsArticles = async () => {
    // We'll use only mock data since we're ignoring backend integration
    const mockArticles = generateMockArticles();
    setAllArticles(mockArticles);
    setLoading(false);
  };

  const filterArticles = () => {
    // Get enabled categories
    const enabledCategories = preferences
      .filter(pref => pref.isEnabled)
      .map(pref => pref.category);
      
    // If no categories are enabled, show all articles
    if (enabledCategories.length === 0) {
      setDisplayedArticles(allArticles);
      return;
    }
    
    // Filter articles by enabled categories
    const filtered = allArticles.filter(article => 
      enabledCategories.includes(article.category)
    );
    
    setDisplayedArticles(filtered);
  };

  const handleUpdatePreferences = async (updatedPreferences: NewsPreference[]) => {
    if (!currentSession?.user?.id) return;
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: currentSession.user.id,
          preferences: updatedPreferences,
        });

      if (error) throw error;
      setPreferences(updatedPreferences);
      setShowPreferences(false);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  };

  const handleToggleRead = (id: string) => {
    setAllArticles((prevArticles) =>
      prevArticles.map((article) =>
        article.id === id ? { ...article, isRead: !article.isRead } : article
      )
    );
  };

  const handleToggleSave = (id: string) => {
    setAllArticles((prevArticles) =>
      prevArticles.map((article) =>
        article.id === id ? { ...article, isSaved: !article.isSaved } : article
      )
    );
  };

  const handleShare = (id: string) => {
    const article = allArticles.find((article) => article.id === id);
    if (article) {
      navigator.clipboard.writeText(`${article.title} - ${article.source}`);
      alert('Article link copied!');
    }
  };

  const handleTogglePreference = (id: string) => {
    setPreferences((prev) => 
      prev.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">NewsHub</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPreferences(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Preferences"
              >
                <Settings className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Sign out"
              >
                <LogOut className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Active Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {preferences.filter(p => p.isEnabled).length === 0 ? (
              <span className="text-sm text-gray-500">None (showing all news)</span>
            ) : (
              preferences
                .filter(p => p.isEnabled)
                .map(p => (
                  <span 
                    key={p.id} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {p.category}
                  </span>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Latest News</h2>
        </div>

        <div className="grid gap-6">
          {displayedArticles.length > 0 ? (
            displayedArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onToggleRead={handleToggleRead}
                onToggleSave={handleToggleSave}
                onShare={handleShare}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-700">No articles match your current filters.</p>
              <button
                onClick={() => setShowPreferences(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Adjust preferences
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Preferences Panel */}
      {showPreferences && (
        <PreferencesPanel
          isOpen={showPreferences}
          onClose={() => setShowPreferences(false)}
          preferences={preferences}
          onTogglePreference={handleTogglePreference}
        />
      )}
    </div>
  );
}

// Function to generate 50+ mock articles with different categories
function generateMockArticles(): Article[] {
  const categories = ['Technology', 'Health', 'Finance'];
  const sources = {
    'Technology': ['TechCrunch', 'The Verge', 'Wired', 'MIT Technology Review', 'ArsTechnica'],
    'Health': ['WebMD', 'Health.com', 'Medical News Today', 'Science Daily', 'The Lancet'],
    'Finance': ['Bloomberg', 'Financial Times', 'Forbes', 'WSJ', 'CNBC']
  };
  
  const mockArticles: Article[] = [];
  
  // Function to generate a date within the last week
  const getRecentDate = (): string => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 7);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  };
  
  // Generate Technology articles
  const techArticles = [
    {
      title: 'Tech Giants Announce New AI Partnership',
      summary: 'Major tech companies have formed a new alliance to advance responsible AI development.',
      sentiment: 'positive' as const,
    },
    {
      title: 'New Quantum Computing Breakthrough Announced',
      summary: 'Scientists have achieved a major milestone in quantum computing with potential implications for cryptography.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Global Chip Shortage Expected to Continue Through 2025',
      summary: 'Industry analysts predict ongoing supply chain issues affecting semiconductor availability.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Major Security Vulnerability Discovered in Popular Software',
      summary: 'Researchers have found a critical flaw that affects millions of users worldwide.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Virtual Reality Market Shows Signs of Slowdown',
      summary: 'Sales of VR hardware have decreased for the second consecutive quarter.',
      sentiment: 'negative' as const,
    },
    {
      title: 'New Smartphone Series Breaks Pre-Order Records',
      summary: 'The latest flagship phones are seeing unprecedented demand according to manufacturers.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Electric Vehicle Battery Technology Advances',
      summary: 'New research shows promising results for longer-lasting and faster-charging batteries.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Tech Startups Face Funding Challenges in Current Economy',
      summary: 'Venture capital investments have decreased by 30% compared to last year.',
      sentiment: 'negative' as const,
    },
    {
      title: 'AI-Generated Content Guidelines Released',
      summary: 'Industry consortium establishes standards for identifying and labeling AI-created media.',
      sentiment: 'neutral' as const,
    },
    {
      title: 'New Programming Language Gains Popularity Among Developers',
      summary: 'The language designed for concurrent processing is seeing rapid adoption in enterprise applications.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Major Tech Company Announces Layoffs',
      summary: 'Restructuring efforts will affect approximately 5% of the global workforce.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Renewable Energy Powers New Data Centers',
      summary: 'Tech companies commit to 100% renewable energy for their expanding server infrastructure.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Augmented Reality Glasses Set for Consumer Release',
      summary: 'After years of development, a major tech company will release AR glasses next month.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Cybersecurity Incidents Rise by 40% in First Quarter',
      summary: 'Ransomware attacks and data breaches continue to affect organizations globally.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Open Source AI Models Match Commercial Alternatives',
      summary: 'Independent benchmarks show comparable performance between free and paid large language models.',
      sentiment: 'neutral' as const,
    },
    {
      title: 'Blockchain Technology Adoption Increases in Supply Chain',
      summary: 'More companies implement blockchain solutions to improve transparency and tracking.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Social Media Platform Introduces New Privacy Controls',
      summary: 'Users will have more granular options for managing their data and content visibility.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Tech Industry Faces New Regulatory Challenges',
      summary: 'Lawmakers propose comprehensive legislation affecting data practices and market competition.',
      sentiment: 'negative' as const,
    }
  ];
  
  // Generate Health articles
  const healthArticles = [
    {
      title: 'New Health Study Reveals Benefits of Meditation',
      summary: 'Researchers found that daily meditation can significantly reduce stress levels.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Global Health Organization Issues New Dietary Guidelines',
      summary: 'Updated recommendations focus on reducing processed food consumption.',
      sentiment: 'neutral' as const,
    },
    {
      title: 'Breakthrough in Cancer Treatment Shows Promising Results',
      summary: 'Clinical trials report higher efficacy and fewer side effects with new targeted therapy.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Mental Health Services Face Unprecedented Demand',
      summary: 'Wait times for therapy and counseling services continue to increase nationwide.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Study Links Sleep Quality to Cognitive Performance',
      summary: 'Research confirms the importance of deep sleep for memory and learning.',
      sentiment: 'neutral' as const,
    },
    {
      title: 'New Vaccine Shows 95% Efficacy Against Emerging Virus',
      summary: 'Clinical trials demonstrate strong immune response with minimal adverse effects.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Telemedicine Usage Remains High Post-Pandemic',
      summary: 'Virtual healthcare visits continue to be popular for routine consultations.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Antibiotic Resistance Reaches Alarming Levels',
      summary: 'Health authorities warn about declining effectiveness of common antibiotics.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Research Identifies New Benefits of Intermittent Fasting',
      summary: 'Study shows metabolic improvements beyond weight management.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Air Pollution Linked to Increased Heart Disease Risk',
      summary: 'Long-term exposure to particulate matter correlates with higher rates of cardiovascular issues.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Wearable Health Technology Market Expands',
      summary: 'Consumer demand grows for devices that monitor various health metrics.',
      sentiment: 'positive' as const,
    },
    {
      title: 'New Guidelines for Childhood Screen Time Released',
      summary: 'Pediatric associations recommend stricter limits on digital media exposure.',
      sentiment: 'neutral' as const,
    },
    {
      title: 'Hospital Staffing Shortages Continue Nationwide',
      summary: 'Healthcare facilities struggle to maintain adequate staffing levels for patient care.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Plant-Based Diet Linked to Lower Inflammation Markers',
      summary: 'Research shows reduction in chronic inflammation indicators among study participants.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Healthcare Costs Rise for Fourth Consecutive Year',
      summary: 'Annual report indicates average 8% increase in medical expenses.',
      sentiment: 'negative' as const,
    },
    {
      title: 'New Treatments for Alzheimer\'s Disease Enter Final Testing Phase',
      summary: 'Promising results in early trials give hope for effective therapy.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Genetic Testing Becomes More Accessible',
      summary: 'Lower costs and improved technology make genetic screening more widely available.',
      sentiment: 'positive' as const,
    }
  ];
  
  // Generate Finance articles
  const financeArticles = [
    {
      title: 'Global Markets React to Economic Report',
      summary: 'Markets showed volatility after the release of surprising economic indicators.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Central Bank Announces Interest Rate Decision',
      summary: 'Policy makers vote to maintain current rates amid inflation concerns.',
      sentiment: 'neutral' as const,
    },
    {
      title: 'Major Bank Reports Record Quarterly Profits',
      summary: 'Financial institution exceeds analyst expectations with strong performance.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Stock Market Reaches All-Time High',
      summary: 'Major indices break records as investor confidence grows.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Cryptocurrency Regulation Framework Proposed',
      summary: 'New legislation aims to provide clarity for digital asset markets.',
      sentiment: 'neutral' as const,
    },
    {
      title: 'Housing Market Shows Signs of Cooling',
      summary: 'Home prices decline for first time in 18 months as mortgage rates rise.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Inflation Rate Exceeds Expectations',
      summary: 'Consumer price index rises more than anticipated, affecting purchasing power.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Tech Startup Valuation Reaches $10 Billion After Funding Round',
      summary: 'Investment consortium provides significant capital for expansion plans.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Retirement Savings Gap Widens Among Demographics',
      summary: 'Research shows growing disparity in retirement readiness across population groups.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Global Supply Chain Improvements Lower Consumer Prices',
      summary: 'Logistics enhancements lead to cost reductions in retail sector.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Corporate Tax Reform Proposal Gains Support',
      summary: 'Bipartisan effort to update tax code advances in legislature.',
      sentiment: 'neutral' as const,
    },
    {
      title: 'Oil Prices Fluctuate Amid Global Production Changes',
      summary: 'Energy markets respond to production adjustment announcements.',
      sentiment: 'neutral' as const,
    },
    {
      title: 'Small Business Lending Program Expands',
      summary: 'New initiative increases access to capital for entrepreneurs.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Major Merger Blocked by Regulatory Authority',
      summary: 'Proposed corporate combination halted due to competition concerns.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Consumer Confidence Index Shows Improvement',
      summary: 'Monthly survey indicates growing optimism about economic conditions.',
      sentiment: 'positive' as const,
    },
    {
      title: 'Bond Market Signals Economic Uncertainty',
      summary: 'Yield curve changes reflect investor concerns about future growth.',
      sentiment: 'negative' as const,
    },
    {
      title: 'Pension Fund Reports Strong Annual Return',
      summary: 'Investment strategy delivers above-average performance for retirees.',
      sentiment: 'positive' as const,
    }
  ];
  
  // Add all articles to the main array with proper metadata
  let id = 1;
  
  // Process Technology articles
  techArticles.forEach(article => {
    mockArticles.push({
      id: id.toString(),
      title: article.title,
      summary: article.summary,
      sentiment: article.sentiment,
      source: sources.Technology[Math.floor(Math.random() * sources.Technology.length)],
      date: getRecentDate(),
      isRead: Math.random() > 0.8,
      isSaved: Math.random() > 0.9,
      category: 'Technology'
    });
    id++;
  });
  
  // Process Health articles
  healthArticles.forEach(article => {
    mockArticles.push({
      id: id.toString(),
      title: article.title,
      summary: article.summary,
      sentiment: article.sentiment,
      source: sources.Health[Math.floor(Math.random() * sources.Health.length)],
      date: getRecentDate(),
      isRead: Math.random() > 0.8,
      isSaved: Math.random() > 0.9,
      category: 'Health'
    });
    id++;
  });
  
  // Process Finance articles
  financeArticles.forEach(article => {
    mockArticles.push({
      id: id.toString(),
      title: article.title,
      summary: article.summary,
      sentiment: article.sentiment,
      source: sources.Finance[Math.floor(Math.random() * sources.Finance.length)],
      date: getRecentDate(),
      isRead: Math.random() > 0.8,
      isSaved: Math.random() > 0.9,
      category: 'Finance'
    });
    id++;
  });
  
  // Sort by date (most recent first)
  mockArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return mockArticles;
}