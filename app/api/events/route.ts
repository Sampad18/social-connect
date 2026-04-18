import { NextRequest, NextResponse } from 'next/server';
import { eventScraper, ScrapingConfig } from '@/lib/eventScraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.interests && !body.location) {
      return NextResponse.json(
        { error: 'At least one of interests or location is required' },
        { status: 400 }
      );
    }

    // Parse interests from comma-separated string to array
    const interests = body.interests 
      ? (typeof body.interests === 'string' 
          ? body.interests.split(',').map((i: string) => i.trim()).filter((i: string) => i)
          : body.interests)
      : [];

    // Configure scraping
    const scrapingConfig: ScrapingConfig = {
      platforms: body.platforms || ['all'],
      location: body.location || '',
      interests,
      dateRange: body.dateRange
    };

    // Scrape events from platforms
    const events = await eventScraper.scrapeAllPlatforms(scrapingConfig);

    return NextResponse.json({
      success: true,
      events,
      totalEvents: events.length,
      platforms: scrapingConfig.platforms
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
