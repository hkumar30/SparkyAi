# Sparky AI: Make Writing Fun Again
[![Netlify Status](https://api.netlify.com/api/v1/badges/5e626def-9390-4c02-8085-2858b9ea051d/deploy-status)](https://app.netlify.com/sites/sparkifyai/deploys)

Sparky AI is an educational writing assistant that gamifies the process of writing, designed primarily for college students, particularly freshmen and international students. It offers an engaging and interactive way to improve writing skills through gamification, challenges, and instant feedback.

## Features

- **Two Learning Modes**:
  - **Engaged Learning**: Deep dive into writing concepts with gamification, quizzes, and peer review
  - **Quick Learning**: Get rapid feedback and assistance with review, revision, and timed writing sprints

- **Gamification Elements**:
  - Points system for engagement and participation
  - Achievements for reaching various milestones
  - Leaderboard to compete with other users
  - Visual achievement notifications

- **AI-Powered Assistance**:
  - Smart feedback that teaches writing concepts
  - Conversation memory that maintains context between messages
  - Personalized help based on uploaded documents
  - Timed writing sprints with prompt generation

- **Process Writing**:
  - Step-by-step guidance through the writing process
  - Structured framework for larger writing projects
  - Targeted questions to help develop and refine ideas

- **User-Friendly Interface**:
  - Clean, intuitive design with ASU brand colors (#8C1D40, #FFC627)
  - Responsive layout for desktop and mobile devices
  - Accessibility features including text size adjustment and contrast settings
  - Time tracking that measures active writing sessions

## Tech Stack

- **Frontend**: React with styled-components
- **Authentication & Database**: Firebase (Authentication, Firestore, Storage)
- **AI Integration**: OpenAI API
- **Hosting**: Netlify

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sparky-ai.git
   cd sparky-ai
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   ```

4. Update the Firebase configuration in `src/firebase/config.js` with your own Firebase project details.

### Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Set up Storage for file uploads
5. Update the security rules for Firestore and Storage to secure your data

### Running the Application

To start the development server:

```
npm start
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```
npm run build
```

### Deployment to Netlify

1. Create a new site in Netlify
2. Connect to your GitHub repository
3. Set up the build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Add your environment variables in the Netlify dashboard
5. Deploy your site

## Project Structure

```
sparky-ai/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatLayout.js
│   │   │   └── ThinkingIndicator.js
│   │   └── common/
│   │       ├── AccessibilityControls.js
│   │       ├── AchievementNotification.js
│   │       ├── Button.js
│   │       └── Navbar.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── firebase/
│   │   └── config.js
│   ├── pages/
│   │   ├── Achievements.js
│   │   ├── EngagedLearning.js
│   │   ├── Home.js
│   │   ├── Leaderboard.js
│   │   ├── Login.js
│   │   ├── Profile.js
│   │   ├── QuickLearning.js
│   │   └── Register.js
│   ├── services/
│   │   └── openaiService.js
│   ├── styles/
│   │   ├── GlobalStyles.js
│   │   └── theme.js
│   ├── utils/
│   │   └── authUtils.js
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## Future Enhancements

- Social features: Share achievements and writing progress with friends
- More gamification elements: Daily challenges, streaks, and writing competitions
- Advanced analytics: Track writing improvement over time
- Mobile app version for iOS and Android
- Integration with educational platforms and LMS
- Enhanced NLP capabilities for more tailored feedback

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenAI for providing the AI technology
- Firebase for backend services
- React and styled-components for the frontend framework
- All contributors who have helped improve this project
