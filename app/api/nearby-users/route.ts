import { NextRequest, NextResponse } from 'next/server';
import { victimsTracker } from '@/lib/victimsTracker';

export interface NearbyUser {
  email: string;
  name: string;
  mood: string;
  postcode: string;
  interests: string[];
  signedUpAt: string;
}

export interface NearbyUsersResponse {
  success: boolean;
  users: NearbyUser[];
  totalUsers: number;
}

// Simulated database of users (in production, this would come from your database)
const simulatedUsers: NearbyUser[] = [
  {
    email: 'user1@example.com',
    name: 'Alice Johnson',
    mood: 'happy',
    postcode: 'SW1A 1AA',
    interests: ['music', 'art', 'community'],
    signedUpAt: '2024-04-01T10:00:00.000Z'
  },
  {
    email: 'user2@example.com',
    name: 'Bob Smith',
    mood: 'relaxed',
    postcode: 'SW1A 2AA',
    interests: ['sports', 'wellness', 'outdoor'],
    signedUpAt: '2024-04-02T14:30:00.000Z'
  },
  {
    email: 'user3@example.com',
    name: 'Carol Davis',
    mood: 'energetic',
    postcode: 'SW1A 3AA',
    interests: ['technology', 'networking', 'fitness'],
    signedUpAt: '2024-04-05T09:15:00.000Z'
  },
  {
    email: 'user4@example.com',
    name: 'David Wilson',
    mood: 'social',
    postcode: 'SW1A 4AA',
    interests: ['books', 'art', 'reading'],
    signedUpAt: '2024-04-10T16:45:00.000Z'
  },
  {
    email: 'user5@example.com',
    name: 'Emma Brown',
    mood: 'curious',
    postcode: 'SW1A 5AA',
    interests: ['food', 'music', 'festival'],
    signedUpAt: '2024-04-15T11:20:00.000Z'
  },
  {
    email: 'user6@example.com',
    name: 'Frank Miller',
    mood: 'adventurous',
    postcode: 'SW1A 6AA',
    interests: ['hiking', 'outdoor', 'travel'],
    signedUpAt: '2024-04-20T08:30:00.000Z'
  },
  {
    email: 'user7@example.com',
    name: 'Grace Lee',
    mood: 'anxious',
    postcode: 'SW1A 7AA',
    interests: ['wellness', 'meditation', 'yoga'],
    signedUpAt: '2024-04-25T13:00:00.000Z'
  },
  {
    email: 'user8@example.com',
    name: 'Henry Taylor',
    mood: 'lonely',
    postcode: 'SW1A 8AA',
    interests: ['community', 'volunteer', 'support'],
    signedUpAt: '2024-04-30T10:00:00.000Z'
  },
];

// Mood compatibility mapping for nearby users
const moodCompatibility: { [key: string]: string[] } = {
  'happy': ['happy', 'relaxed', 'social', 'curious', 'energetic'],
  'relaxed': ['relaxed', 'happy', 'curious', 'wellness', 'art'],
  'energetic': ['energetic', 'active', 'adventurous', 'social', 'happy'],
  'social': ['social', 'happy', 'energetic', 'community', 'networking'],
  'curious': ['curious', 'relaxed', 'wellness', 'art', 'learning', 'museum'],
  'adventurous': ['adventurous', 'energetic', 'outdoor', 'travel', 'hiking', 'active'],
  'anxious': ['anxious', 'wellness', 'meditation', 'yoga', 'relaxed', 'calm'],
  'lonely': ['lonely', 'social', 'community', 'support', 'volunteer', 'wellness'],
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postcode = searchParams.get('postcode');
    const mood = searchParams.get('mood');

    // Get nearby users based on postcode and mood compatibility
    let nearbyUsers = simulatedUsers;

    // Filter by postcode (first 2-3 characters for area matching)
    if (postcode) {
      const userArea = postcode.substring(0, 3).toLowerCase();
      nearbyUsers = nearbyUsers.filter(user => {
        const userArea = user.postcode.substring(0, 3).toLowerCase();
        return userArea === userArea;
      });
    }

    // Filter by mood compatibility
    if (mood) {
      const compatibleMoods = moodCompatibility[mood.toLowerCase()] || [];
      nearbyUsers = nearbyUsers.filter(user => compatibleMoods.includes(user.mood.toLowerCase()));
    }

    // Filter by interests (if provided)
    const interests = searchParams.get('interests');
    if (interests) {
      const interestList = interests.split(',').map((i: string) => i.trim().toLowerCase());
      nearbyUsers = nearbyUsers.filter(user => 
        user.interests.some(userInterest => userInterest.toLowerCase().includes(userInterest))
      );
    }

    const response: NearbyUsersResponse = {
      success: true,
      users: nearbyUsers,
      totalUsers: nearbyUsers.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
