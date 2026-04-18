import { NextRequest, NextResponse } from 'next/server';
import { eventScraper, ScrapingConfig } from '@/lib/eventScraper';
import { aiRecommendationEngine, UserProfile } from '@/lib/aiRecommendationEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'age', 'email', 'gender', 'interests', 'postcode', 'livingSituation', 'occupation'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Parse interests from comma-separated string to array
    const interests = typeof body.interests === 'string' 
      ? body.interests.split(',').map((i: string) => i.trim()).filter((i: string) => i)
      : body.interests;

    // Build user profile
    const userProfile: UserProfile = {
      name: body.name,
      age: parseInt(body.age),
      gender: body.gender,
      interests,
      postcode: body.postcode,
      livingSituation: body.livingSituation,
      occupation: body.occupation,
      mood: body.mood,
      preferences: body.preferences
    };

    // Configure scraping
    const scrapingConfig: ScrapingConfig = {
      platforms: body.platforms || ['all'],
      location: body.postcode,
      interests,
      dateRange: body.dateRange
    };

    // Scrape events from platforms
    const events = await eventScraper.scrapeAllPlatforms(scrapingConfig);

    if (events.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No events found matching your criteria',
        recommendations: [],
        summary: 'Try adjusting your interests or location to find more events.',
        totalEvents: 0,
        topRecommendations: 0
      });
    }

    // Generate AI recommendations
    const recommendations = await aiRecommendationEngine.generateRecommendations(
      userProfile,
      events,
      body.limit || 10
    );

    return NextResponse.json({
      success: true,
      message: 'Recommendations generated successfully',
      ...recommendations
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
