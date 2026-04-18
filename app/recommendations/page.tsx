'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { victimsTracker } from '@/lib/victimsTracker';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  platform: string;
  url: string;
  category: string;
  imageUrl?: string;
  price?: string;
  attendees?: number;
}

interface RecommendationResult {
  event: Event;
  score: number;
  reason: string;
  matchFactors: string[];
}

interface NearbyUser {
  email: string;
  name: string;
  mood: string;
  postcode: string;
  interests: string[];
  signedUpAt: string;
}

interface RecommendationData {
  recommendations: RecommendationResult[];
  summary: string;
  totalEvents: number;
  topRecommendations: number;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [data, setData] = useState<RecommendationData | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load recommendations from session storage
    const storedData = sessionStorage.getItem('recommendations');
    if (storedData) {
      setData(JSON.parse(storedData));
    }

    // Load nearby users when recommendations are loaded
    if (data) {
      const userMood = sessionStorage.getItem('userMood') || '';
      if (userMood) {
        fetchNearbyUsers(data.recommendations[0]?.event.location, userMood);
      }
    }
  }, []);

  const fetchNearbyUsers = async (location: string, mood: string) => {
    try {
      const response = await fetch(`/api/nearby-users?postcode=${encodeURIComponent(location)}&mood=${encodeURIComponent(mood)}`, {
        method: 'GET',
      });

      const result = await response.json();
      
      if (result.success) {
        setNearbyUsers(result.users);
      } else {
        console.error('Failed to fetch nearby users:', result.error);
      setError('Failed to load nearby users');
      }
    } catch (err) {
      console.error('Error fetching nearby users:', err);
      setError('Failed to load nearby users');
    }
  };

  const handleEventClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleLoadProfile = (email: string) => {
    const profile = victimsTracker.getProfileByEmail(email);
    if (profile) {
      // Save as current profile
      victimsTracker.setCurrentProfile(profile);
      
      // Navigate back to home with profile data
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2a2a2 2-12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2a2a2 2-12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Recommendations Found</h2>
          <p className="text-gray-600 mb-4">Please submit the form to get personalized event recommendations.</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      'happy': '😊',
      'relaxed': '😌',
      'energetic': '⚡',
      'social': '🤝',
      'curious': '🤔',
      'adventurous': '🚀',
      'sad': '😢',
      'anxious': '😰',
      'lonely': '😔',
    };
    return moodEmojis[mood.toLowerCase()] || '😐';
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-12" />
            </svg>
            Back to Form
          </button>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Personalized Recommendations</h1>
          <p className="text-gray-600 text-lg">{data?.summary}</p>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2a2 2-12" />
              </svg>
              {data?.totalEvents} events found
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4.162 2 12" />
              </svg>
              {data?.topRecommendations} top recommendations
            </span>
          </div>

          {/* Nearby Users Section */}
          {nearbyUsers.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                People Nearby Looking for {data?.recommendations[0]?.event.category} Events
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Connect with others who share your interests and mood to make meaningful connections.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearbyUsers.map((user, index) => (
                  <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-600">
                          {getMoodEmoji(user.mood)} {user.mood}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.interests.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <button
                        onClick={() => handleLoadProfile(user.email)}
                        className="px-3 py-1 bg-white text-indigo-600 text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.recommendations.map((rec, index) => (
              <div
                key={rec.event.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleEventClick(rec.event.url)}
              >
                {/* Event Image */}
                {rec.event.imageUrl && (
                  <div className="h-48 bg-gray-200 relative">
                    <img
                      src={rec.event.imageUrl}
                      alt={rec.event.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Match Score Badge */}
                    <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-md">
                      <span className="text-sm font-semibold text-indigo-600">
                        {Math.round(rec.score * 100)}% Match
                      </span>
                    </div>
                    {/* Platform Badge */}
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
                      {rec.event.platform}
                    </div>
                  </div>
                )}

                {/* Event Details */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {rec.event.category}
                    </span>
                    {rec.event.price && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        {rec.event.price}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {rec.event.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {rec.event.description}
                  </p>

                  {/* AI Reasoning */}
                  <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-indigo-800">
                      <span className="font-semibold">Why this event:</span> {rec.reason}
                    </p>
                  </div>

                  {/* Event Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3c7l-12" />
                      </svg>
                      <span className="ml-1">
                        {new Date(rec.event.date).toLocaleDateString('en-GB', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l7l12" />
                      </svg>
                      <span className="ml-1">
                        {rec.time}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657 12" />
                      </svg>
                      <span className="ml-1">
                        {rec.location}
                      </span>
                    </div>
                    {rec.attendees && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h19v-2H10a9 9m9 5" />
                        </svg>
                        <span className="ml-1">
                          {rec.attendees} attending
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Match Factors */}
                  {rec.matchFactors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-1">
                        {rec.matchFactors.map((factor, idx) => (
                          <span
                            key={idx}
                            className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium"
                          >
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

          {/* No Results */}
          {data?.recommendations.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 2 12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your interests or preferences to find more events.</p>
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Update Preferences
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Click on any event to view more details on the original platform.</p>
            <p className="mt-1">Recommendations are generated by our AI based on your interests and mood.</p>
          </div>
        </div>
    </div>
  );
}
