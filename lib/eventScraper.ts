
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

  // Comprehensive mock events database
  private mockEvents: Event[] = [
    // Technology Events
    {
      id: 'meetup-1',
      title: 'Tech Networking Night',
      description: 'Join us for an evening of networking with fellow tech enthusiasts, startups, and developers. Great for making professional connections.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '18:00',
      location: 'London',
      platform: 'Meetup',
      url: 'https://meetup.com/tech-networking',
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
      price: 'Free',
      attendees: 45
    },
    {
      id: 'meetup-2',
      title: 'AI & Machine Learning Meetup',
      description: 'Monthly meetup discussing latest trends in AI, machine learning, and data science. Beginners welcome!',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:00',
      location: 'London',
      platform: 'Meetup',
      url: 'https://meetup.com/ai-meetup',
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1677449603666-dc3b491a1f5?w=400',
      price: 'Free',
      attendees: 60
    },
    {
      id: 'eventbrite-1',
      title: 'Web Development Workshop',
      description: 'Hands-on workshop covering React, Next.js, and modern web development practices.',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      location: 'London',
      platform: 'Eventbrite',
      url: 'https://eventbrite.com/web-dev-workshop',
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f65507c?w=400',
      price: '£25',
      attendees: 30
    },
    
    // Sports & Fitness Events
    {
      id: 'meetup-3',
      title: 'Morning Yoga in the Park',
      description: 'Start your day with peaceful outdoor yoga session. All levels welcome, mats provided.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '07:00',
      location: 'London',
      platform: 'Meetup',
      url: 'https://meetup.com/yoga-park',
      category: 'Sports',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2a004bea0?w=400',
      price: 'Free',
      attendees: 20
    },
    {
      id: 'eventbrite-2',
      title: '5K Charity Run',
      description: 'Join our community charity run supporting local causes. Walkers and runners welcome!',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '08:00',
      location: 'London',
      platform: 'Eventbrite',
      url: 'https://eventbrite.com/5k-run',
      category: 'Sports',
      imageUrl: 'https://images.unsplash.com/photo-1552674605-5d4534b9e13?w=400',
      price: '£10',
      attendees: 200
    },
    {
      id: 'facebook-1',
      title: 'Group Tennis Session',
      description: 'Casual tennis meetups for all skill levels. Rackets available to borrow.',
      date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:00',
      location: 'London',
      platform: 'Facebook',
      url: 'https://facebook.com/events/tennis',
      category: 'Sports',
      imageUrl: 'https://images.unsplash.com/photo-1554068865-514a8e48e3d?w=400',
      price: '£5',
      attendees: 12
    },
    
    // Arts & Culture Events
    {
      id: 'meetup-4',
      title: 'Photography Walk',
      description: 'Explore the city and capture beautiful moments with fellow photography enthusiasts.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      location: 'London',
      platform: 'Meetup',
      url: 'https://meetup.com/photography-walk',
      category: 'Art',
      imageUrl: 'https://images.unsplash.com/photo-1542038784458-1b94a03a948a?w=400',
      price: 'Free',
      attendees: 25
    },
    {
      id: 'eventbrite-3',
      title: 'Art Exhibition Opening',
      description: 'Grand opening of contemporary art exhibition featuring emerging local artists.',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '18:30',
      location: 'London',
      platform: 'Eventbrite',
      url: 'https://eventbrite.com/art-exhibition',
      category: 'Art',
      imageUrl: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081?w=400',
      price: '£15',
      attendees: 100
    },
    {
      id: 'facebook-2',
      title: 'Pottery Workshop',
      description: 'Learn to create beautiful pottery pieces. All materials included.',
      date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:00',
      location: 'London',
      platform: 'Facebook',
      url: 'https://facebook.com/events/pottery',
      category: 'Art',
      imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a63d8e0c65?w=400',
      price: '£30',
      attendees: 15
    },
    
    // Music & Entertainment Events
    {
      id: 'eventbrite-4',
      title: 'Music Festival Weekend',
      description: 'Three days of live music featuring local and international artists across multiple stages.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '12:00',
      location: 'London',
      platform: 'Eventbrite',
      url: 'https://eventbrite.com/music-festival',
      category: 'Music',
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf599eb5b?w=400',
      price: '£50-£150',
      attendees: 500
    },
    {
      id: 'meetup-5',
      title: 'Open Mic Night',
      description: 'Share your music, poetry, or comedy. Sign up on arrival to perform.',
      date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '20:00',
      location: 'London',
      platform: 'Meetup',
      url: 'https://meetup.com/open-mic',
      category: 'Music',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d6cd318?w=400',
      price: 'Free',
      attendees: 35
    },
    
    // Food & Drink Events
    {
      id: 'facebook-3',
      title: 'Local Food Festival',
      description: 'Taste dishes from local restaurants and food trucks. Family-friendly event.',
      date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:00',
      location: 'London',
      platform: 'Facebook',
      url: 'https://facebook.com/events/food-festival',
      category: 'Food',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      price: '£5 entry',
      attendees: 200
    },
    {
      id: 'eventbrite-5',
      title: 'Wine Tasting Experience',
      description: 'Sample wines from around the world with expert guidance. Light snacks provided.',
      date: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:00',
      location: 'London',
      platform: 'Eventbrite',
      url: 'https://eventbrite.com/wine-tasting',
      category: 'Food',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-47d2a27d07b?w=400',
      price: '£35',
      attendees: 40
    },
    
    // Books & Literature Events
    {
      id: 'meetup-6',
      title: 'Book Club Meeting',
      description: 'Monthly book discussion - this month: "The Midnight Library" by Matt Haig.',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:00',
      location: 'London',
      platform: 'Meetup',
      url: 'https://meetup.com/book-club',
      category: 'Books',
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca7bd4f4a3?w=400',
      price: 'Free',
      attendees: 15
    },
    {
      id: 'facebook-4',
      title: 'Poetry Reading',
      description: 'Open mic poetry reading featuring local poets. Come listen or share your work.',
      date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '18:00',
      location: 'London',
      platform: 'Facebook',
      url: 'https://facebook.com/events/poetry',
      category: 'Books',
      imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead7a8a?w=400',
      price: 'Free',
      attendees: 30
    },
    
    // Wellness & Health Events
    {
      id: 'eventbrite-6',
      title: 'Wellness Workshop',
      description: 'Learn mindfulness and stress management techniques for modern life.',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:00',
      location: 'London',
      platform: 'Eventbrite',
      url: 'https://eventbrite.com/wellness-workshop',
      category: 'Wellness',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2a004bea0?w=400',
      price: '£25',
      attendees: 30
    },
    {
      id: 'meetup-7',
      title: 'Meditation Group',
      description: 'Guided meditation sessions for beginners and experienced practitioners.',
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '07:30',
      location: 'London',
      platform: 'Meetup',
      url: 'https://meetup.com/meditation',
      category: 'Wellness',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
      price: 'Free',
      attendees: 20
    },
    
    // Community & Social Events
    {
      id: 'facebook-5',
      title: 'Community Cleanup Day',
      description: 'Join neighbors for a community cleanup and beautification project. All supplies provided.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '09:00',
      location: 'London',
      platform: 'Facebook',
      url: 'https://facebook.com/events/cleanup',
      category: 'Community',
      imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628b2c4e?w=400',
      price: 'Free',
      attendees: 75
    },
    {
      id: 'meetup-8',
      title: 'New in Town Social',
      description: 'Social gathering for people new to the area. Make friends and discover local spots!',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '18:30',
      location: 'London',
      platform: 'Meetup',
      url: 'https://meetup.com/new-in-town',
      category: 'Community',
      imageUrl: 'https://images.unsplash.com/photo-152915606989-959a0709f9d?w=400',
      price: 'Free',
      attendees: 50
    },
    
    // Outdoor & Adventure Events
    {
      id: 'eventbrite-7',
      title: 'Hiking Adventure',
      description: 'Guided hike through scenic trails. All fitness levels welcome. Bring water!',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '08:00',
      location: 'London',
      platform: 'Eventbrite',
      url: 'https://eventbrite.com/hiking',
      category: 'Outdoor',
      imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
      price: 'Free',
      attendees: 40
    },
    {
      id: 'facebook-6',
      title: 'Cycling Group Ride',
      description: 'Leisurely group cycling through parks and city routes. Helmets recommended.',
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      location: 'London',
      platform: 'Facebook',
      url: 'https://facebook.com/events/cycling',
      category: 'Outdoor',
      imageUrl: 'https://images.unsplash.com/photo-1541625602330-227d83f0a5c?w=400',
      price: 'Free',
      attendees: 25
    },
  ];

  async scrapeMeetup(config: ScrapingConfig): Promise<Event[]> {
    try {
      // Filter mock events for Meetup platform
      return this.mockEvents.filter(event => event.platform === 'Meetup');
    } catch (error) {
      console.error('Error scraping Meetup:', error);
      return [];
    }
  }

  async scrapeEventbrite(config: ScrapingConfig): Promise<Event[]> {
    try {
      // Filter mock events for Eventbrite platform
      return this.mockEvents.filter(event => event.platform === 'Eventbrite');
    } catch (error) {
      console.error('Error scraping Eventbrite:', error);
      return [];
    }
  }

  async scrapeFacebookEvents(config: ScrapingConfig): Promise<Event[]> {
    try {
      // Filter mock events for Facebook platform
      return this.mockEvents.filter(event => event.platform === 'Facebook');
    } catch (error) {
      console.error('Error scraping Facebook Events:', error);
      return [];
    }
  }

  async scrapeAllPlatforms(config: ScrapingConfig): Promise<Event[]> {
    let allEvents: Event[] = [];

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
