# Social Connect

An AI-powered platform to help socially isolated individuals find community events and activities.

## Features

- User profile collection (name, age, email, gender, interests, postcode, living situation, occupation)
- AI-powered event recommendations based on mood and interests
- Integration with community event platforms
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
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

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy

## Project Structure

```
social-connect/
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page with user form
├── components/           # React components (to be added)
├── lib/                  # Utility functions (to be added)
├── types/                # TypeScript types (to be added)
└── public/               # Static assets
```

## API Integrations (To be implemented)

- Meetup API
- Eventbrite API
- Google Maps Geocoding API
- OpenAI API for mood analysis

## License

MIT
