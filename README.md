# Interview Article Generator

An AI-powered application that generates interview questions on any topic and creates compelling articles based on your answers.

## Architecture

- **Backend**: NestJS API server with OpenAI integration (TypeScript)
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npm run start:dev
```

Backend runs on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

Frontend runs on `http://localhost:3000`

## Features

- 🤖 AI-generated interview questions on any topic
- 📝 Text and voice input for answers
- 📄 Automatic article generation (300-450 words)
- 🎨 Beautiful, responsive UI
- ⚡ Real-time generation with loading states

## Tech Stack

**Backend:**
- NestJS
- OpenAI GPT-4
- TypeScript
- dotenv

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hooks

## API Endpoints

- `POST /api/questions/generate` - Generate interview questions
- `POST /api/articles/generate` - Generate article from answers

## Environment Variables

**Backend (`.env`):**
```
OPENAI_API_KEY=your_key_here
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend (`.env.local`):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```
