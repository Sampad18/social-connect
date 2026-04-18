# Social Connect

An AI-powered platform to help socially isolated individuals find community events and activities.

## Features

### User Experience
- **Comprehensive User Profile**: Collects name, age, email, gender, interests, postcode, living situation, and occupation
- **Mood-Based Recommendations**: Users can specify their current mood (happy, relaxed, energetic, social, curious, adventurous)
- **Advanced Preferences**: 
  - Preferred group size (small, medium, large)
  - Preferred time of day (morning, afternoon, evening)
  - Budget preferences (free, low, medium, high)
  - Activity level (relaxed, moderate, active)
- **Personalized Recommendations**: AI-powered event suggestions with match scores and explanations
- **Beautiful UI**: Responsive design with Tailwind CSS

### AI Agent Capabilities
- **Multi-Platform Event Scraping**: Fetches events from Meetup, Eventbrite, and Facebook
- **Intelligent Matching**: Analyzes user interests, mood, location, and preferences
- **AI-Powered Reasoning**: Uses OpenAI or Anthropic AI to generate personalized explanations for each recommendation
- **Fallback Logic**: Rule-based recommendations when AI services are unavailable
- **Match Scoring**: Calculates relevance scores based on multiple factors:
  - Interest matching (30% weight)
  - Location proximity (20% weight)
  - Age appropriateness (15% weight)
  - Mood compatibility (20% weight)
  - User preferences (15% weight)

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Next.js 14**: App Router with server components
- **API Routes**: RESTful endpoints for recommendations and event fetching
- **Session Storage**: Temporary storage of recommendations for user experience

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **AI Services**: OpenAI GPT-3.5 / Anthropic Claude (optional)
- **Web Scraping**: Cheerio, Axios
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables (Optional)

To enable AI-powered reasoning, add these to your `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Note**: The application works without API keys using rule-based recommendations. AI keys enhance the quality of explanations.

## Project Structure

```
social-connect/
├── app/
│   ├── api/
│   │   ├── events/               # Event fetching endpoint
│   │   │   └── route.ts
│   │   ├── recommendations/      # AI recommendations endpoint
│   │   │   └── route.ts
│   │   └── submit-form/         # Form submission endpoint
│   │       └── route.ts
│   ├── recommendations/           # Recommendations display page
│   │   └── page.tsx
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx               # Home page with user form
├── lib/
│   ├── aiRecommendationEngine.ts # AI recommendation logic
│   └── eventScraper.ts         # Event scraping from platforms
├── public/                    # Static assets
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── vercel.json              # Vercel deployment configuration
```

## API Endpoints

### POST `/api/recommendations`
Generates personalized event recommendations based on user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "gender": "male",
  "interests": ["music", "art", "technology"],
  "postcode": "SW1A 1AA",
  "livingSituation": "unmarried",
  "occupation": "Software Engineer",
  "mood": "social",
  "preferences": {
    "groupSize": "medium",
    "timeOfDay": "evening",
    "budget": "medium",
    "activityLevel": "moderate"
  }
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "event": {
        "id": "meetup-1",
        "title": "Tech Networking Night",
        "description": "Join us for an evening of networking...",
        "date": "2024-04-25",
        "time": "18:00",
        "location": "London",
        "platform": "Meetup",
        "url": "https://meetup.com/tech-networking",
        "category": "Technology",
        "imageUrl": "https://...",
        "price": "Free",
        "attendees": 45
      },
      "score": 0.85,
      "reason": "This event matches your interest in technology and fits your social mood.",
      "matchFactors": ["Interest Match", "Mood Compatible", "Free Event"]
    }
  ],
  "summary": "Based on your interests in music, art, and technology and your social mood, I found 8 events with an average match score of 78%.",
  "totalEvents": 8,
  "topRecommendations": 8
}
```

### POST `/api/events`
Fetches events from multiple platforms based on criteria.

**Request Body:**
```json
{
  "platforms": ["all"],
  "location": "SW1A 1AA",
  "interests": ["music", "art"],
  "dateRange": {
    "start": "2024-04-01T00:00:00Z",
    "end": "2024-04-30T23:59:59Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "events": [...],
  "totalEvents": 15,
  "platforms": ["all"]
}
```

## How the AI Agent Works

1. **User Input**: User fills out comprehensive form with interests, mood, and preferences
2. **Event Scraping**: Agent scrapes events from multiple platforms (Meetup, Eventbrite, Facebook)
3. **Preference Matching**: Calculates match scores based on:
   - Interest overlap with event categories
   - Location proximity (postcode-based)
   - Age-appropriate events
   - Mood compatibility
   - User preferences (group size, time, budget, activity level)
4. **AI Reasoning**: Uses AI services to generate personalized explanations for each recommendation
5. **Ranking**: Sorts events by match score
6. **Display**: Presents top recommendations with visual match indicators

## Supported Platforms

- **Meetup**: Technology, photography, book clubs, and more
- **Eventbrite**: Music festivals, art exhibitions, wellness workshops
- **Facebook**: Community events, food festivals, local gatherings

## Deployment

### Vercel (Recommended)

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy

Vercel will automatically:
- Build the Next.js application
- Deploy to global CDN
- Provide SSL certificates
- Set up automatic deployments on git push

### Environment Variables in Production

Add these in Vercel Dashboard → Settings → Environment Variables:
- `OPENAI_API_KEY` (optional)
- `ANTHROPIC_API_KEY` (optional)

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New Platforms

To add a new event platform:

1. Add scraping method in `lib/eventScraper.ts`
2. Update `scrapeAllPlatforms` method
3. Add platform to UI platform selector (if needed)

### Customizing AI Logic

Modify `lib/aiRecommendationEngine.ts`:
- Adjust scoring weights
- Add new matching criteria
- Modify mood-event mappings
- Customize AI prompts

## Future Enhancements

- [ ] Real-time API integration with Meetup, Eventbrite, Facebook
- [ ] User authentication and saved preferences
- [ ] Event booking integration
- [ ] Calendar sync
- [ ] Social features (event sharing, RSVPs)
- [ ] Push notifications for new events
- [ ] Geographic-based event discovery
- [ ] Multi-language support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
