## Tech Stack

**Backend:**
- Runtime: Node.js 18+ (Vercel Serverless Functions)
- Language: TypeScript with strict mode enabled
- AI: Google Gemini API (@google/generative-ai, @google/genai)
- Image Processing: fal.ai for video frame extraction
- Data: CSV-based historical data with in-memory caching
- Testing: Jest + fast-check (property-based testing)

**Frontend:**
- Framework: React 18 + TypeScript
- Build Tool: Vite
- UI: shadcn/ui components + Radix UI primitives
- Styling: Tailwind CSS
- Routing: React Router v6
- State: React Context + TanStack Query
- Charts: Recharts

**Deployment:**
- Platform: Vercel (serverless functions + static hosting)
- Function timeout: 60 seconds
- Function memory: 1024MB

## Common Commands

```bash
# Backend development
npm install              # Install backend dependencies
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run type-check       # TypeScript type checking
npm run dev              # Local development (requires Vercel CLI)

# Frontend development
cd fronted
npm install              # Install frontend dependencies
npm run dev              # Start dev server
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build

# Deployment
vercel                   # Deploy to Vercel
vercel env add           # Add environment variables
```

## Key Libraries

- `@google/generative-ai`: Gemini text/video analysis
- `@google/genai`: Gemini image generation (2.5-flash-image model)
- `@fal-ai/serverless-client`: Video frame extraction
- `formidable`: Multipart form data parsing
- `csv-parse`: CSV data parsing
- `uuid`: Session ID generation
- `fast-check`: Property-based testing
