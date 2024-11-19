# US Government News Application

A full-stack web application that aggregates and displays real-time US government news and congressional activities.

## 🌐 Live Demo
[US Government News App](https://us-government-news-2e4863aa1ad0.herokuapp.com/)

## 🚀 Features

### News Aggregation
- Real-time news articles from GNews API
- Responsive and modern UI
- Error handling for article fetching

### Congressional Activity Tracking
- Recent bills from House and Senate
- Recent congressional votes
- Detailed legislative information
- Integration with Congress.gov API

## 🛠 Technology Stack
- Frontend: React.js (v18.2.0)
- Backend: Node.js, Express.js
- Deployment: Heroku
- APIs:
  - GNews API (News Articles)
  - Congress.gov API (Legislative Activities)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/docjill/EC_111924.git
cd EC_111924
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```env
NEWS_API_KEY=your_gnews_api_key
CONGRESS_API_KEY=your_congress_api_key
```

4. Start the development server:
```bash
npm run dev
```

## 📦 Dependencies
- node-fetch
- date-fns
- Socket.IO
- Helmet
- Compression
- CORS

## 🔒 Security Features
- Helmet middleware for HTTP headers
- CORS configuration
- Environment-based configuration
- API key protection
- Error handling with minimal information exposure

## 💡 Design Philosophy
- Modern, clean UI
- Responsive and accessible design
- Performance-focused implementation
- Security-first approach

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/docjill/EC_111924/issues).

## 📝 License
This project is MIT licensed.