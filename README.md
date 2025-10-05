# SpiraFlow

> AI-Powered Voice-First Thought Journal & Reflection Coach

SpiraFlow is a modern web application that helps you capture and reflect on your thoughts through voice journaling. With AI-powered transcription, mood analysis, and adaptive reflection prompts, SpiraFlow makes it easy to maintain a consistent journaling practice.

![SpiraFlow](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎤 Voice-First Recording
- **Quick Record Button**: Start capturing your thoughts instantly
- **Pause/Resume**: Take breaks during longer journaling sessions
- **Real-time Duration Tracking**: See how long you've been recording
- **Offline Recording**: Works without internet connection

### 🤖 AI-Powered Analysis
- **Automatic Transcription**: Uses OpenAI's Whisper API for accurate speech-to-text
- **Mood Detection**: AI identifies your emotional state (happy, calm, stressed, etc.)
- **Topic Extraction**: Automatically tags entries with relevant topics
- **Emotion Tracking**: Detects subtle emotional nuances in your words

### 💭 Adaptive Reflection Prompts
- **Pattern Recognition**: Learns from your journaling history
- **Contextual Prompts**: Generates personalized reflection questions
- **Trend Analysis**: Identifies recurring themes and triggers
- **Growth-Oriented**: Prompts designed to encourage self-discovery

### 📊 Dashboard & Insights
- **Visual Analytics**: Beautiful charts showing your journaling patterns
- **Mood Trends**: Track emotional changes over time
- **Topic Analysis**: See what you think about most
- **Weekly Activity**: Monitor your journaling consistency

### 🔒 Privacy-First
- **Offline-First**: All data stored locally using IndexedDB
- **Encrypted Storage**: Your entries are secure on your device
- **Optional Cloud Sync**: Backup to encrypted cloud storage (coming soon)
- **No Tracking**: Your data never leaves your device unless you choose to sync

### 🎨 Beautiful UI
- **Minimalistic Design**: Clean, distraction-free interface
- **Responsive**: Works perfectly on desktop and mobile
- **Dark Mode Support**: Easy on the eyes (coming soon)
- **Smooth Animations**: Delightful user experience with Framer Motion

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SpiraFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Recording Your First Entry

1. Click the microphone button on the home page
2. Speak freely - share your thoughts, feelings, or daily experiences
3. Use the pause button if you need to take a break
4. Click the stop button when finished
5. Wait a moment while AI processes your recording

### Understanding AI Analysis

After recording, SpiraFlow will:
- Transcribe your audio to text
- Identify the main topics you discussed
- Detect your emotional state and mood
- Generate personalized reflection prompts

### Exploring Your Dashboard

Visit the Dashboard page to see:
- Total entries and recording time
- Weekly activity patterns
- Mood distribution pie chart
- Emotional trend line over 30 days
- Most discussed topics

### Searching History

The History page lets you:
- Browse all your entries chronologically
- Search by keywords, topics, or emotions
- Filter by mood
- Click any entry to view details

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Lucide React**: Beautiful icons

### Backend & APIs
- **Next.js API Routes**: Serverless functions
- **OpenAI Whisper API**: Speech-to-text transcription
- **OpenAI GPT-4o-mini**: Natural language analysis and prompt generation

### Data & Storage
- **IndexedDB (via idb)**: Client-side database
- **Offline-first architecture**: Works without internet
- **Zustand**: State management (optional)

### Charts & Visualization
- **Recharts**: Beautiful, responsive charts
- **date-fns**: Date manipulation

## 📁 Project Structure

```
SpiraFlow/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── transcribe/       # Whisper transcription
│   │   ├── analyze/          # Mood & topic analysis
│   │   └── generate-prompts/ # AI prompt generation
│   ├── dashboard/            # Dashboard page
│   ├── history/              # Entry history page
│   ├── settings/             # Settings page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home/recording page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── RecordButton.tsx      # Voice recording interface
│   ├── TranscriptionView.tsx # Transcription display
│   ├── AIPrompts.tsx         # Reflection prompts
│   ├── EntryCard.tsx         # Journal entry card
│   ├── Dashboard.tsx         # Dashboard with charts
│   └── Navigation.tsx        # App navigation
├── lib/                      # Utility libraries
│   ├── db.ts                 # IndexedDB operations
│   ├── audio.ts              # Audio recording logic
│   └── analytics.ts          # Data analysis utilities
├── types/                    # TypeScript type definitions
│   └── index.ts
└── package.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for Whisper and GPT | Yes |
| `NEXTAUTH_SECRET` | Secret for authentication | No |
| `NEXTAUTH_URL` | Auth callback URL | No |

### Customization

#### Mood Colors
Edit the `MOOD_COLORS` object in `components/Dashboard.tsx` to customize mood chart colors.

#### AI Prompts
Modify the system prompts in `app/api/generate-prompts/route.ts` to adjust AI behavior.

#### UI Theme
Customize colors in `tailwind.config.js` under the `theme.extend.colors` section.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Roadmap

- [ ] Dark mode support
- [ ] Cloud sync with Firebase/MongoDB
- [ ] Google Sign-In authentication
- [ ] Audio playback of recordings
- [ ] Export entries as PDF
- [ ] Mobile app (React Native)
- [ ] Advanced search with filters
- [ ] Tagging system
- [ ] Reminders and notifications
- [ ] Integration with calendar apps

## ⚠️ Privacy & Security

SpiraFlow takes your privacy seriously:

- **Local Storage**: All data is stored in your browser's IndexedDB
- **No Analytics**: We don't track your usage
- **Encrypted**: Future cloud sync will use end-to-end encryption
- **OpenAI Processing**: Audio/text is sent to OpenAI for processing but not stored by them (per their API policy)

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Design inspired by [getrecall.ai](https://getrecall.ai)
- Built with [Next.js](https://nextjs.org/)
- AI powered by [OpenAI](https://openai.com/)
- Icons by [Lucide](https://lucide.dev/)

## 📧 Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for better self-reflection**

