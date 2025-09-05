# 🌴 Cyplanner - North Cyprus Travel Companion 🧳

![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.0.14-38B2AC?style=flat-square&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=flat-square&logo=vite)
![Google Maps](https://img.shields.io/badge/Google_Maps_API-Integrated-4285F4?style=flat-square&logo=google-maps)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-Integrated-8E75B2?style=flat-square)

A modern web application to help travelers discover and plan their perfect trip to North Cyprus with AI-powered recommendations, interactive maps, and comprehensive travel guides.

## 👥 SyntaxSquad(SST25)

- [Emad Ramezani] - [Project Manager / Lead Developer] - [[GitHub](https://github.com/Emadram)/[LinkedIn Profile Link](https://www.linkedin.com/in/emad-ramezani-747287207/)]
- [Taniya Dibaee] - [UI/UX Designer] - [[GitHub](https://github.com/Taniya-Diba)/[LinkedIn Profile Link](https://www.linkedin.com/in/taniya-dibaee)]
- [Parnia sedighparvar] - [Documenter] - [[GitHub](https://github.com/parnias8)/[LinkedIn Profile Link](https://www.linkedin.com/in/parnia-sedighparvar)]
- [Sohrab Memari] - [Full-Stack Developer] - [[GitHub](https://github.com/Sohrab098)/[LinkedIn Profile Link](https://www.linkedin.com/in/sohrab-memari/)]
- [Mahisa Ahadi] - [Technical Writer] - [[GitHub ](https://github.com/mahisa-ahadi)/[LinkedIn Profile Link](https://www.linkedin.com/in/mahisa-ahadi/)]
- [Reyhane Mirsharghi] - [Marketing Lead] - [[GitHub](https://github.com/reyhanemirsharghi)]/[LinkedIn Profile Link](https://www.linkedin.com/in/reyhane-mir-8b86a929a/)]

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Usage](#-usage)
- [How to Contribute](#-how-to-contribute)
- [License](#-license)
- [Recognition](#-recognition)
- [Acknowledgments](#-acknowledgments)

## ✨ Features

- **🤖 AI-Powered Travel Assistant**: Get personalized recommendations based on your interests using Gemini AI
- **🗺️ Interactive Maps**: Explore destinations with Google Maps integration
- **📍 Location Discovery**: Find and save interesting locations with photos and details
- **🗓️ Event Calendar**: Browse upcoming events with details and booking options
- **🏨 Accommodation & Deals**: Browse hotels, restaurants, and special deals
- **🧭 Travel Guide**: Detailed information about popular destinations with highlights and activities
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🔐 User Authentication**: Sign up and sign in functionality

## 🔧 Technologies

- **Frontend Framework**: React 19.0.0
- **Styling**: Tailwind CSS 4.0.14
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router 7.3.0
- **HTTP Client**: Axios 1.8.3
- **Maps Integration**: Google Maps API
- **AI Integration**: Gemini 1.5 API
- **Icons**: React Icons, Font Awesome
- **State Management**: React Hooks
- **Code Quality**: ESLint 9.21.0

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Emadram/Cyplanner-TeknoProject.git
   cd cyplanner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up API keys**:
   You can either:
   - Create a `.env` file in the root directory with the following variables:
     ```
     VITE_API_URL=your_backend_api_url
     VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     VITE_GEMINI_API_KEY=your_gemini_api_key
     ```
   OR
   - Edit the API keys directly in `src/data/SharedData.js` file
   - Set the backend URL in `src/services/api.js`

   Note: For production, it's recommended to use environment variables instead of hardcoding API keys.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:5173` to see the application running.

## 📂 Project Structure

```
cyplanner/
├── public/
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── chat/
│   │   ├── ui/
│   │   └── Layout.jsx
│   ├── data/
│   │   ├── DestinationData.js
│   │   └── SharedData.js
│   ├── pages/
│   │   ├── AiChat.jsx
│   │   ├── Explore.jsx
│   │   ├── Home.jsx
│   │   └── ...
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── apiHelpers.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .eslintrc.js
├── package.json
├── vite.config.js
└── README.md
```

## 📝 Usage

### Home Page
The home page showcases recommended destinations and upcoming events in North Cyprus. Use the search bar to find specific locations or browse featured content.

### AI Chat
Interact with the AI travel assistant to get personalized recommendations based on your interests, budget, and travel style. The assistant can suggest destinations, activities, and itineraries.

### Explore
Use the interactive map to discover locations in North Cyprus. Click on markers to view details about attractions, save favorite locations, and plan your route.

### Travel Guide
Browse comprehensive guides for popular destinations, including highlights, attractions, and insider tips. Each guide includes detailed information and logistics.

### Deals
Find special offers on accommodations, restaurants, activities, and transportation options.

## 🤝 How to Contribute

We welcome contributions from the community! Here's how you can contribute to the project:

### Contribution Workflow

1. **Fork the repository**:
   Click the "Fork" button at the top-right corner of the repository page on GitHub.

2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/cyplanner.git
   cd cyplanner
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/originalowner/cyplanner.git
   ```

4. **Create a new branch for your feature**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make your changes**:
   Implement your feature or bug fix.

6. **Commit your changes with descriptive commit messages**:
   ```bash
   git add .
   git commit -m "Add feature: detailed description of changes"
   ```

7. **Keep your fork in sync with the upstream repository**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   git checkout feature/your-feature-name
   git rebase main
   ```

8. **Push your changes to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

9. **Create a Pull Request**:
   Go to your fork on GitHub and click "New Pull Request" to submit your changes for review.

### Code Style Guidelines

- Follow the existing code style patterns
- Use descriptive variable and function names
- Write meaningful comments for complex logic
- Keep components small and focused on a single responsibility
- Include proper PropTypes for all components

### Testing

Before submitting a PR, please ensure:
- Your code runs without any errors
- New functionality is properly tested
- Existing functionality continues to work as expected

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Recognition

This project was developed for [Teknofest 2025 - TRNC] and achieved:

- [Semi-finalist]
- ⭐ [81/100] (Threshold 85)

## 🙏 Acknowledgments

- Google Maps API for location mapping
- Google's Gemini AI for powering the travel assistant
- All contributors who have helped improve this project

