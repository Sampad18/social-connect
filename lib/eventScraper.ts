import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Event {
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

export interface ScrapingConfig {
  platforms: string[];
  location: string;
  interests: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

class EventScraper {
  private baseUrl = 'https://api.meetup.com';
  private eventbriteBaseUrl = 'https://www.eventbriteapi.com/v3';

  async scrapeMeetup(config: ScrapingConfig): Promise<Event[]> {
    try {
      // Using Meetup's public API (requires API key for production)
      // For demo purposes, we'll simulate the response
      const mockEvents: Event[] = [
        {
          id: 'meetup-1',
          title: 'Tech Networking Night',
          description: 'Join us for an evening of networking with fellow tech enthusiasts',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '18:00',
          location: config.location || 'London',
          platform: 'Meetup',
          url: 'https://meetup.com/tech-networking',
          category: 'Technology',
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
          price: 'Free',
          attendees: 45
        },
        {
          id: 'meetup-2',
          title: 'Photography Walk',
          description: 'Explore the city and capture beautiful moments with fellow photographers',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '10:00',
          location: config.location || 'London',
          platform: 'Meetup',
          url: 'https://meetup.com/photography-walk',
          category: 'Photography',
          imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400',
          price: 'Free',
          attendees: 20
        },
        {
          id: 'meetup-3',
          title: 'Book Club Meeting',
          description: 'Monthly book discussion - this month: "The Midnight Library"',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '19:00',
          location: config.location || 'London',
          platform: 'Meetup',
          url: 'https://meetup.com/book-club',
          category: 'Books',
          imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
          price: 'Free',
          attendees: 15
        }
      ];

      // Filter by interests if provided
      if (config.interests.length > 0) {
        return mockEvents.filter(event => 
          config.interests.some(interest => 
            event.category.toLowerCase().includes(interest.toLowerCase()) ||
            event.title.toLowerCase().includes(interest.toLowerCase()) ||
            event.description.toLowerCase().includes(interest.toLowerCase())
          )
        );
      }

      return mockEvents;
    } catch (error) {
      console.error('Error scraping Meetup:', error);
      return [];
    }
  }

  async scrapeEventbrite(config: ScrapingConfig): Promise<Event[]> {
    try {
      // Using Eventbrite API (requires API key for production)
      // For demo purposes, we'll simulate the response
      const mockEvents: Event[] = [
        {
          id: 'eventbrite-1',
          title: 'Music Festival Weekend',
          description: 'Three days of live music featuring local and international artists',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '12:00',
          location: config.location || 'London',
          platform: 'Eventbrite',
          url: 'https://eventbrite.com/music-festival',
          category: 'Music',
          imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
          price: '£50-£150',
          attendees: 500
        },
        {
          id: 'eventbrite-2',
          title: 'Art Exhibition Opening',
          description: 'Grand opening of contemporary art exhibition featuring emerging artists',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '18:30',
          location: config.location || 'London',
          platform: 'Eventbrite',
          url: 'https://eventbrite.com/art-exhibition',
          category: 'Art',
          imageUrl: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=400',
          price: '£15',
          attendees: 100
        },
        {
          id: 'eventbrite-3',
          title: 'Wellness Workshop',
          description: 'Learn mindfulness and stress management techniques',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '14:00',
          location: config.location || 'London',
          platform: 'Eventbrite',
          url: 'https://eventbrite.com/wellness-workshop',
          category: 'Wellness',
          imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
          price: '£25',
          attendees: 30
        }
      ];

      // Filter by interests if provided
      if (config.interests.length > 0) {
        return mockEvents.filter(event => 
          config.interests.some(interest => 
            event.category.toLowerCase().includes(interest.toLowerCase()) ||
            event.title.toLowerCase().includes(interest.toLowerCase()) ||
            event.description.toLowerCase().includes(interest.toLowerCase())
          )
        );
      }

      return mockEvents;
    } catch (error) {
      console.error('Error scraping Eventbrite:', error);
      return [];
    }
  }

  async scrapeFacebookEvents(config: ScrapingConfig): Promise<Event[]> {
    try {
      // Facebook requires authentication for event access
      // For demo purposes, we'll simulate the response
      const mockEvents: Event[] = [
        {
          id: 'facebook-1',
          title: 'Community Cleanup Day',
          description: 'Join neighbors for a community cleanup and beautification project',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '09:00',
          location: config.location || 'London',
          platform: 'Facebook',
          url: 'https://facebook.com/events/cleanup',
          category: 'Community',
          imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
          price: 'Free',
          attendees: 75
        },
        {
          id: 'facebook-2',
          title: 'Local Food Festival',
          description: 'Taste dishes from local restaurants and food trucks',
          date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '11:00',
          location: config.location || 'London',
          platform: 'Facebook',
          url: 'https://facebook.com/events/food-festival',
          category: 'Food',
          imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
          price: '£5 entry',
          attendees: 200
        }
      ];

      // Filter by interests if provided
      if (config.interests.length > 0) {
        return mockEvents.filter(event => 
          config.interests.some(interest => 
            event.category.toLowerCase().includes(interest.toLowerCase()) ||
            event.title.toLowerCase().includes(interest.toLowerCase()) ||
            event.description.toLowerCase().includes(interest.toLowerCase())
          )
        );
      }

      return mockEvents;
    } catch (error) {
      console.error('Error scraping Facebook Events:', error);
      return [];
    }
  }

  async scrapeAllPlatforms(config: ScrapingConfig): Promise<Event[]> {
    const allEvents: Event[] = [];

    if (config.platforms.includes('meetup') || config.platforms.includes('all')) {
      const meetupEvents = await this.scrapeMeetup(config);
      allEvents.push(...meetupEvents);
    }

    if (config.platforms.includes('eventbrite') || config.platforms.includes('all')) {
      const eventbriteEvents = await this.scrapeEventbrite(config);
      allEvents.push(...eventbriteEvents);
    }

    if (config.platforms.includes('facebook') || config.platforms.includes('all')) {
      const facebookEvents = await this.scrapeFacebookEvents(config);
      allEvents.push(...facebookEvents);
    }

    // Remove duplicates based on title and date
    const uniqueEvents = allEvents.filter((event, index, self) =>
      index === self.findIndex((e) => 
        e.title === event.title && e.date === event.date
      )
    );

    return uniqueEvents;
  }
}

export const eventScraper = new EventScraper();
