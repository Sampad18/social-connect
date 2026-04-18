'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { profileManager } from '@/lib/profileManager';

interface FormData {
  name: string;
  age: string;
  email: string;
  gender: string;
  interests: string;
  postcode: string;
  livingSituation: string;
  occupation: string;
  mood: string;
  groupSize: string;
  timeOfDay: string;
  budget: string;
  activityLevel: string;
}

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    email: '',
    gender: '',
    interests: '',
    postcode: '',
    livingSituation: '',
    occupation: '',
    mood: '',
    groupSize: '',
    timeOfDay: '',
    budget: '',
    activityLevel: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);

  // Load saved profiles on mount
  useEffect(() => {
    const profiles = profileManager.getAllProfiles();
    setSavedProfiles(profiles);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Parse interests from comma-separated string to array
      const interests = typeof formData.interests === 'string' 
        ? formData.interests.split(',').map((i: string) => i.trim()).filter((i: string) => i)
        : formData.interests;

      const userProfile = {
        name: formData.name,
        age: parseInt(formData.age),
        email: formData.email,
        gender: formData.gender,
        interests,
        postcode: formData.postcode,
        livingSituation: formData.livingSituation,
        occupation: formData.occupation,
        mood: formData.mood || undefined,
        preferences: {
          groupSize: formData.groupSize as any || undefined,
          timeOfDay: formData.timeOfDay as any || undefined,
          budget: formData.budget as any || undefined,
          activityLevel: formData.activityLevel as any || undefined,
        },
      };

      // Save profile to localStorage
      profileManager.saveProfile(userProfile);
      profileManager.setCurrentProfile(userProfile);

      // Get recommendations
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      // Store recommendations in session storage
      sessionStorage.setItem('recommendations', JSON.stringify(data));
      
      // Navigate to recommendations page
      router.push('/recommendations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = (email: string) => {
    const profile = profileManager.getProfileByEmail(email);
    if (profile) {
      setFormData({
        name: profile.name,
        age: profile.age.toString(),
        email: profile.email,
        gender: profile.gender,
        interests: profile.interests.join(', '),
        postcode: profile.postcode,
        livingSituation: profile.livingSituation,
        occupation: profile.occupation,
        mood: profile.mood || '',
        groupSize: profile.preferences?.groupSize || '',
        timeOfDay: profile.preferences?.timeOfDay || '',
        budget: profile.preferences?.budget || '',
        activityLevel: profile.preferences?.activityLevel || '',
      });
    }
  };

  const deleteProfile = (email: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      profileManager.deleteProfile(email);
      const profiles = profileManager.getAllProfiles();
      setSavedProfiles(profiles);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Social Connect</h1>
          <p className="text-gray-600 text-lg">Find Your Community</p>
          <p className="text-gray-500 mt-2">Our AI agent will search for community events and activities based on your interests and mood.</p>
        </div>

        {/* Saved Profiles */}
        {savedProfiles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Saved Profiles</h3>
            <div className="space-y-3">
              {savedProfiles.map((profile, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{profile.name}</p>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadProfile(profile.email)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteProfile(profile.email)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                required
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Enter your age"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Enter your email address"
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Interests */}
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                Interests *
              </label>
              <input
                type="text"
                id="interests"
                name="interests"
                required
                value={formData.interests}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g., sports, music, art, reading, hiking, cooking"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple interests with commas</p>
            </div>

            {/* PostCode */}
            <div>
              <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
                PostCode *
              </label>
              <input
                type="text"
                id="postcode"
                name="postcode"
                required
                value={formData.postcode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Enter your postcode (e.g., SW1A 1AA)"
              />
            </div>

            {/* Living Situation */}
            <div>
              <label htmlFor="livingSituation" className="block text-sm font-medium text-gray-700 mb-1">
                Living Situation *
              </label>
              <select
                id="livingSituation"
                name="livingSituation"
                required
                value={formData.livingSituation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">Select your living situation</option>
                <option value="married">Married</option>
                <option value="unmarried">Unmarried (single)</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="cohabiting">Cohabiting</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                Occupation *
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                required
                value={formData.occupation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Enter your occupation"
              />
            </div>

            {/* Mood */}
            <div>
              <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">
                How are you feeling today? (Optional)
              </label>
              <select
                id="mood"
                name="mood"
                value={formData.mood}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">Select your mood</option>
                <option value="happy">Happy</option>
                <option value="relaxed">Relaxed</option>
                <option value="energetic">Energetic</option>
                <option value="social">Social</option>
                <option value="curious">Curious</option>
                <option value="adventurous">Adventurous</option>
              </select>
            </div>

            {/* Preferences Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Preferences (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Group Size */}
                <div>
                  <label htmlFor="groupSize" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Group Size
                  </label>
                  <select
                    id="groupSize"
                    name="groupSize"
                    value={formData.groupSize}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">No preference</option>
                    <option value="small">Small (under 30 people)</option>
                    <option value="medium">Medium (30-100 people)</option>
                    <option value="large">Large (100+ people)</option>
                  </select>
                </div>

                {/* Time of Day */}
                <div>
                  <label htmlFor="timeOfDay" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <select
                    id="timeOfDay"
                    name="timeOfDay"
                    value={formData.timeOfDay}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">No preference</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">No preference</option>
                    <option value="free">Free events only</option>
                    <option value="low">Low (under £20)</option>
                    <option value="medium">Medium (£20-£50)</option>
                    <option value="high">High (£50+)</option>
                  </select>
                </div>

                {/* Activity Level */}
                <div>
                  <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Level
                  </label>
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">No preference</option>
                    <option value="relaxed">Relaxed</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Finding Activities...' : 'Find Activities for Me'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Your information is secure and will only be used to find relevant activities for you.
        </p>
      </div>
    </div>
  );
}
