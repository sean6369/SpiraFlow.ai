# SpiraFlow Quick Start Guide

Get SpiraFlow up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18 or higher installed ([Download](https://nodejs.org/))
- [ ] OpenAI API key ([Get one](https://platform.openai.com/api-keys))
- [ ] A modern web browser (Chrome, Firefox, Safari, or Edge)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- OpenAI SDK
- Tailwind CSS
- Framer Motion
- IndexedDB wrapper
- Chart libraries

### 2. Configure OpenAI API Key

**Important**: You need an OpenAI API key for transcription and analysis to work.

Edit `.env.local` and add your API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

> **Note**: The `.env.local` file is already created for you. Just replace `your_openai_api_key_here` with your actual key.

### 3. Start Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.2.5
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### 4. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## First Use

### Recording Your First Entry

1. **Grant Microphone Permission**: When prompted, allow microphone access
2. **Click the Blue Mic Button**: Start recording
3. **Speak Naturally**: Share your thoughts, no need to be formal
4. **Pause If Needed**: Use the pause button for breaks
5. **Stop When Done**: Click the red stop button

### What Happens Next

After stopping:
1. ⏳ Audio is transcribed (takes 5-30 seconds depending on length)
2. 🤖 AI analyzes your mood and topics
3. 💭 Personalized reflection prompts are generated
4. 💾 Everything is saved to your browser's local storage

### Exploring Features

- **Dashboard**: Click "Dashboard" to see your stats and charts
- **History**: Click "History" to browse all entries
- **Search**: Use the search bar to find specific entries
- **Filter**: Filter entries by mood

## Troubleshooting

### Microphone Not Working
- Check browser permissions (look for 🎤 icon in address bar)
- Try a different browser
- Make sure no other app is using the microphone

### Transcription Failed
- Verify your OpenAI API key is correct
- Check you have API credits available
- Look in browser console for error messages (F12)

### No Data Showing
- IndexedDB might be disabled in your browser
- Try clearing site data and starting fresh
- Check browser console for errors

### Slow Performance
- Transcription time depends on recording length and OpenAI API response
- First recording may take longer (cold start)
- Large recordings (>5 minutes) will take longer to process

## API Costs

SpiraFlow uses OpenAI's APIs which have associated costs:

- **Whisper API**: ~$0.006 per minute of audio
- **GPT-4o-mini**: ~$0.0001 per prompt

**Example costs**:
- 10 minutes of recording per day for a month: ~$1.80
- Typical journal entry (3 minutes): ~$0.02

## Next Steps

### Customize Your Experience

1. **Explore Settings**: Visit `/settings` to manage your data
2. **Build a Habit**: Try journaling daily for best insights
3. **Review Dashboard**: Check your dashboard weekly to see patterns

### Advanced Configuration

- Edit `tailwind.config.js` to customize colors
- Modify AI prompts in `app/api/generate-prompts/route.ts`
- Adjust chart settings in `components/Dashboard.tsx`

## Production Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable
vercel env add OPENAI_API_KEY
```

### Deploy to Other Platforms

SpiraFlow works on any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Node.js

**Important**: Always set your `OPENAI_API_KEY` environment variable!

## Privacy Reminder

- All journal entries are stored **locally** in your browser
- Audio/text is sent to OpenAI for processing only
- OpenAI does not store your data (per their API policy)
- No third-party analytics or tracking
- Optional cloud sync coming soon (encrypted)

## Getting Help

- 📖 Read the full [README.md](./README.md)
- 🐛 Found a bug? Open an issue on GitHub
- 💡 Have ideas? Suggestions are welcome!
- 📧 Questions? Check existing issues first

## Tips for Best Results

### Recording Tips
- Find a quiet environment
- Speak clearly at normal pace
- Don't worry about "ums" and pauses (AI handles them well)
- Let thoughts flow naturally - this is stream of consciousness!

### Journaling Tips
- Be consistent - even 2 minutes daily helps
- Review your dashboard weekly to spot patterns
- Use AI prompts to go deeper
- Don't self-censor - this is for you only

### Privacy Tips
- Use a private browser if on shared device
- Export your data regularly as backup
- Clear browser data to delete all entries
- Future cloud sync will use encryption

---

**Enjoy your SpiraFlow journey! 🌊✨**

