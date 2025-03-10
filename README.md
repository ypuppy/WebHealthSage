# WebHealthSage

An AI-powered website analysis platform that provides comprehensive insights into website performance, SEO, and sentiment.

## Features

- OpenAI-driven website analysis
- Real-time performance and SEO scanning
- Security headers verification
- Accessibility compliance checking 
- Content sentiment analysis
- Modern React-based UI with shadcn components

## Prerequisites

- Node.js (v20 or later)
- OpenAI API key

## Environment Variables

Create a `.env` file in the root directory with:

```env
OPENAI_API_KEY=your_openai_api_key
```

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd website-analysis-tool
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- Frontend: React, TanStack Query, shadcn/ui
- Backend: Express.js
- AI: OpenAI GPT-4
- Utilities: Cheerio for HTML parsing
- Styling: Tailwind CSS

## License

MIT