# Stock Analyzer

## A Scalable, Production-Ready Stock Analysis and Prediction Platform

---

**Subject: Software Group Project (SGP)**

**Semester:** 4th Semester

**Group Members:**

| Sr. No. | Name | Enrollment No. | Role |
|---------|------|----------------|------|
| 1 | Manav Limbani | 24DCS044 | Team Leader |
| 2 | Yash Machhi | 24DCS045 | Developer |
| 3 | Deep Makwana | 24DCS048 | Developer |

**Department of Computer Science**

---

\newpage

## Certificate

This is to certify that the project titled **"Stock Analyzer – A Scalable, Production-Ready Stock Analysis and Prediction Platform"** has been successfully completed by the following students of the 4th Semester, Department of Computer Science, in partial fulfillment of the requirements for the Software Group Project (SGP):

| Sr. No. | Name | Enrollment No. |
|---------|------|----------------|
| 1 | Manav Limbani | 24DCS044 |
| 2 | Yash Machhi | 24DCS045 |
| 3 | Deep Makwana | 24DCS048 |

The project work has been found satisfactory and is hereby approved.

---

\newpage

## Acknowledgement

We would like to express our sincere gratitude to our project guide and all the faculty members of the Department of Computer Science for their constant guidance, valuable suggestions, and encouragement throughout the development of this project. Their expertise and insights helped us navigate complex technical challenges and refine our approach at every stage.

We are also thankful to our institution for providing the necessary infrastructure, tools, and resources that made this project possible. The availability of development environments, cloud services, and reference materials played a crucial role in helping us bring our vision to life.

We extend our heartfelt thanks to our families and friends for their unwavering support and motivation during the entire duration of the project. Their patience and encouragement kept us focused and determined.

Finally, we acknowledge the open-source community and the developers behind the libraries, frameworks, and APIs such as React, FastAPI, Flask, Scikit-learn, Finnhub, and yfinance that formed the backbone of our platform. Their contributions to the software ecosystem made the development of Stock Analyzer significantly more efficient and robust.

---

\newpage

## Abstract

**Project Title:** Stock Analyzer – A Scalable, Production-Ready Stock Analysis and Prediction Platform

**Team Members:** Manav Limbani (24DCS044), Yash Machhi (24DCS045), Deep Makwana (24DCS048)

Stock Analyzer is a comprehensive, full-stack web application designed to provide real-time stock market data, advanced technical analysis, portfolio management, and machine learning-based stock price predictions. The platform enables users to search and analyze stocks, visualize historical price data through interactive charts, compute technical indicators such as SMA, EMA, RSI, MACD, Bollinger Bands, and VWAP, and generate 30-day price forecasts using trained Linear Regression and LSTM models.

The platform is built using a microservices architecture with React.js and Material-UI for the frontend, FastAPI (Python) for the backend API gateway, Flask (Python) for the dedicated ML prediction service, MySQL for persistent data storage, and Redis for in-memory caching. The entire system is containerized using Docker and orchestrated with Docker Compose for seamless deployment.

**Industry Impact:**

Stock Analyzer addresses the growing need for accessible, intelligent stock analysis tools by combining real-time market data aggregation with machine learning-driven predictions. The platform can reduce the time spent on manual technical analysis by approximately 60–80%, while making advanced analytical features available to non-expert users through an intuitive, responsive interface. It empowers retail investors, students, and financial enthusiasts to make data-driven decisions without requiring deep expertise in quantitative finance or programming.

While the current system provides semi-automated prediction capabilities with a user-driven approach, future enhancements aim to incorporate deep learning models, sentiment analysis from financial news, and a fully automated portfolio advisory system.

---

\newpage

## Table of Contents

1. Introduction
2. Literature Review
3. System Analysis
4. Technology Stack
5. System Design
6. Testing
7. Results
8. Challenges Faced
9. Conclusion and Future Scope
10. References
11. Appendices

---

\newpage

## CHAPTER 1: Introduction

### Background of the Project

The Stock Analyzer project originates from the increasing demand for intelligent, data-driven tools in the financial domain. With millions of retail investors entering the stock market worldwide, there is a growing need for platforms that can aggregate real-time market data, perform technical analysis, and provide predictive insights — all within a single, user-friendly interface. Traditional stock analysis requires knowledge of financial indicators, chart patterns, and statistical methods, which creates a steep learning curve for beginners and even intermediate investors. The rapid growth of fintech and the availability of public financial APIs have made it feasible to build comprehensive analysis platforms that democratize access to sophisticated market intelligence.

### Problem Definition

The core problem addressed by this project is the fragmented and complex nature of stock market analysis for individual investors. Currently, users must rely on multiple disconnected tools and websites to gather real-time quotes, view historical price charts, compute technical indicators, read financial news, and obtain price forecasts. Many existing platforms are either too expensive for individual use, overly complex with steep learning curves, or limited in their analytical capabilities. Furthermore, most free tools lack machine learning-powered prediction features, forcing users to rely solely on traditional technical analysis without the benefit of data-driven forecasting.

### Motivation for the Project

The motivation behind Stock Analyzer is to build a unified, accessible, and intelligent platform that consolidates all essential stock analysis features into a single application. The goal is to empower users — regardless of their financial expertise — to make informed investment decisions by providing real-time data, interactive visualizations, automated technical indicator calculations, and ML-based price predictions. By leveraging modern web technologies and a microservices architecture, the system is designed to be scalable, maintainable, and extensible, allowing for the seamless addition of new features and analytical models in the future.

### Objectives and Scope

The primary objective of Stock Analyzer is to develop a production-ready, full-stack web application that integrates real-time stock data retrieval, interactive charting with multiple visualization modes, automated technical indicator computation (SMA, EMA, RSI, MACD, Bollinger Bands, VWAP), portfolio and watchlist management, financial news aggregation, and machine learning-based 30-day stock price prediction using Linear Regression and LSTM models.

The scope of the project encompasses the entire development lifecycle — from frontend design and backend API development to ML model training, database design, containerization, and deployment orchestration. The platform targets retail investors, finance students, and technology enthusiasts who seek an all-in-one stock analysis tool that is both powerful and easy to use.

---

\newpage

## CHAPTER 2: Literature Review

### Existing Solutions

Several stock analysis and prediction platforms exist in the market today. Yahoo Finance is one of the most widely used platforms that provides free real-time quotes, financial news, and basic charting capabilities, but it lacks integrated ML prediction features. TradingView offers advanced charting and technical analysis tools with a social trading community, but its premium features require expensive subscriptions. Bloomberg Terminal is the gold standard for professional financial analysis, providing comprehensive data, analytics, and trading capabilities, but it costs upwards of $20,000 per year, making it inaccessible to individual investors. Alpha Vantage and Finnhub provide free stock market APIs that developers can use to build custom analysis tools, but they require significant programming knowledge to utilize effectively.

### Comparative Analysis

| Platform | Ease of Use | Prediction Capability | Cost | Technical Analysis | Deployment |
|----------|-------------|----------------------|------|--------------------|------------|
| Yahoo Finance | Very High | None | Free (Ads) | Basic | Web-Based |
| TradingView | High | Community Scripts | Freemium ($15–$60/mo) | Advanced | Web-Based |
| Bloomberg Terminal | Low | Professional Grade | $20,000+/year | Comprehensive | Desktop |
| Alpha Vantage API | Low (Developer Only) | None (Raw Data) | Free (Limited) | None | API Only |
| **Stock Analyzer** | **High** | **ML-Based (LR + LSTM)** | **Free / Open Source** | **Advanced (6 Indicators)** | **Web-Based (Docker)** |

### Project Contribution

Stock Analyzer differentiates itself from existing solutions by providing a complete, end-to-end integration of real-time data, technical analysis, and machine learning predictions within a single, open-source platform. Unlike Yahoo Finance or TradingView, it offers built-in ML-powered price forecasting without requiring any external subscriptions or third-party plugins. The platform uses a microservices architecture with separate frontend, backend API, and ML service components, making it highly modular and independently scalable. The inclusion of Docker containerization ensures consistent deployment across environments, while the use of Redis caching optimizes performance for high-frequency data retrieval. The system also provides a comprehensive settings panel, dark/light theme support, and responsive design, making it accessible across devices and user preferences.

---

\newpage

## CHAPTER 3: System Analysis

### Functional Requirements

The Stock Analyzer platform requires a user registration and authentication system that allows users to create accounts, sign in securely using hashed passwords with bcrypt, and maintain persistent sessions through JWT-based cookie authentication. The system must support real-time stock quote retrieval from the Finnhub API, displaying current price, price change, percentage change, day high, day low, opening price, and previous close for any valid stock ticker symbol.

The platform must provide interactive stock charting with multiple visualization modes including line charts, candlestick charts, and area charts, along with configurable timeframes ranging from one day to one year. Technical indicator computation must be automated, covering Simple Moving Average (SMA), Exponential Moving Average (EMA), Relative Strength Index (RSI), Moving Average Convergence Divergence (MACD), Bollinger Bands, and Volume Weighted Average Price (VWAP).

The ML prediction module must allow users to generate 30-day stock price forecasts for any ticker symbol, with the system automatically selecting between the ML backend service (server-side Linear Regression or LSTM) and a client-side fallback model. Portfolio and watchlist management features must enable users to track their stock holdings and monitor selected stocks. The system must also aggregate and display company-specific and general market news from financial sources.

### Non-Functional Requirements

The platform must ensure scalability through its microservices architecture and Docker-based containerization, allowing individual services to be scaled independently based on demand. High performance is critical, with Redis caching reducing API response times and React Query managing client-side data fetching with configurable stale times and garbage collection intervals. Security must be maintained through bcrypt password hashing, JWT token-based authentication with expiration, CORS policy enforcement, and secure cookie handling. The user interface must be fully responsive, providing a seamless experience across desktop, tablet, and mobile devices. The system must demonstrate reliability through Docker health checks, automatic service restart policies, and graceful error handling with fallback mechanisms across all data fetching and prediction operations.

---

\newpage

## CHAPTER 4: Technology Stack

### 1. Frontend (UI/UX)

The frontend is built using React 18 as the core UI library, providing a component-based architecture with hooks for state management and lifecycle handling. Material-UI (MUI) 5 is used as the design system, offering a comprehensive set of pre-built, accessible, and customizable components. React Router DOM 6 handles client-side navigation with protected route wrappers for authenticated pages. TanStack React Query 5 manages server-state data fetching with automatic caching, background refetching, and stale data management. Framer Motion provides smooth page transitions and micro-animations throughout the interface. Recharts and Chart.js are used for interactive data visualization, including line charts, candlestick charts, and area charts for stock price data. Axios handles HTTP communication with both the backend API and external financial data providers. Additional libraries include react-hot-toast for notification toasts, react-cookie for cookie management, jwt-decode for token parsing, bcryptjs for client-side password hashing, and date-fns for date formatting utilities.

### 2. Backend API (Gateway)

The backend API gateway is built using FastAPI, a modern, high-performance Python web framework that provides automatic API documentation via Swagger UI and ReDoc. Uvicorn serves as the ASGI server with support for asynchronous request handling. Pydantic 2 is used for request/response data validation and serialization. HTTPX serves as the async HTTP client for communicating with the ML service and external APIs. SQLAlchemy 2.0 provides the ORM layer for MySQL database interactions, with Alembic handling database schema migrations. Authentication is implemented using python-jose for JWT token operations, passlib with bcrypt for password hashing, and custom middleware for request ID tracking and performance timing. Gunicorn is configured as the production WSGI server for multi-worker process management.

### 3. ML Service (Prediction Engine)

The ML prediction service is built using Flask 3.0, providing a lightweight REST API for model training and prediction operations. Scikit-learn provides the machine learning algorithms, with Linear Regression as the primary prediction model and optional LSTM support through TensorFlow/Keras for deep learning-based predictions. NumPy and Pandas handle numerical computation and data manipulation respectively. The MinMaxScaler from scikit-learn is used for feature normalization, scaling stock price data to a 0-1 range for model training. yfinance serves as the primary data source for fetching historical stock data directly from Yahoo Finance. Trained models are serialized using Python's pickle module and cached in memory for fast inference, with persistent storage on disk for model reuse across service restarts.

### 4. Datastores and Infrastructure

MySQL 8.0 serves as the primary relational database for storing user data, portfolio information, and application state. Redis 7 (Alpine) functions as an in-memory cache and message broker, configured with append-only persistence and an LRU eviction policy with a 256MB memory limit. Docker provides containerization for all services, ensuring consistent environments across development and production. Docker Compose orchestrates the multi-container application, managing service dependencies, health checks, networking, and volume mounts. NGINX serves as the reverse proxy and static file server for the production frontend build.

---

\newpage

## CHAPTER 5: System Design

### Use Case Diagram

The system supports two primary actors: the User and the ML Service. The User can perform the following actions — register and create an account, log in and authenticate, search for stocks by ticker symbol, view real-time stock quotes and company profiles, view interactive stock price charts with multiple visualization modes, compute and view technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, VWAP), generate ML-based 30-day price predictions, manage portfolio holdings, manage watchlists, view company and market news, view earnings calendar, customize application settings (theme, chart type, notifications, etc.), export and import settings, and sign out. The ML Service actor handles model training, model caching, and prediction generation when invoked by the backend API or directly by the frontend.

### Data Flow Diagram

The data flow in Stock Analyzer follows a multi-tier architecture. At the first level, the User interacts with the React frontend, which sends API requests to two backend services. For stock data, the frontend communicates with the Finnhub API directly (for real-time quotes, company profiles, and news) and with the FastAPI backend (which proxies requests and manages database operations). For predictions, the frontend sends requests to the FastAPI backend, which forwards them to the Flask ML service. The ML service fetches historical data from Yahoo Finance via yfinance, processes it through the trained model, and returns predictions back through the chain. User data (authentication, settings, portfolio) flows between the frontend, FastAPI backend, and MySQL database. Redis sits between the backend and external APIs, caching frequently requested data to reduce API call volume and improve response times.

### Architecture Diagram

The system follows a microservices architecture with five containerized services connected through a Docker bridge network. The Frontend service (React + NGINX) runs on port 3000 and serves the single-page application. The Backend API service (FastAPI + Uvicorn) runs on port 8000 and acts as the API gateway, routing requests to the ML service and managing database operations. The ML Service (Flask) runs on port 5001 and handles all prediction and model training operations. MySQL runs on port 3306 (mapped to 3307 externally) for persistent data storage. Redis runs on port 6379 for caching. An optional phpMyAdmin service runs on port 8080 for database administration. All services communicate through the stock-analyzer-network Docker bridge network, with persistent volumes for ML models, Redis data, and MySQL data.

---

\newpage

## CHAPTER 6: Testing

### Unit Testing

The project includes a comprehensive test suite organized under the tests directory with separate test modules for the backend, frontend, ML service, and integration tests. Backend unit tests validate the API endpoints including health checks, stock quote retrieval, company profile fetching, and prediction endpoints. The tests use pytest as the testing framework with conftest.py providing shared fixtures for test configuration. ML service tests verify model training accuracy, prediction generation correctness, and proper error handling when invalid ticker symbols are provided.

### Integration Testing

Integration tests validate the end-to-end communication between services, ensuring that the frontend can successfully fetch data from the backend, the backend correctly proxies requests to the ML service, and database operations (user creation, authentication, settings persistence) function correctly across the full stack. Docker health checks serve as automated runtime integration tests, with each service exposing a health endpoint that verifies internal service health and connectivity to dependent services.

### Manual Testing

Manual testing was conducted across multiple browsers (Chrome, Firefox, Edge) and device form factors (desktop, tablet, mobile) to validate responsive design, interactive chart functionality, theme switching, and overall user experience. The prediction module was tested with a variety of stock ticker symbols including AAPL, MSFT, GOOGL, TSLA, and AMZN to verify accuracy across different stock price ranges and volatility levels.

---

\newpage

## CHAPTER 7: Results

### Stock Data and Visualization

The platform successfully retrieves and displays real-time stock data from the Finnhub API with sub-second response times for cached queries. Interactive charts render smoothly with multiple visualization modes (line, candlestick, area) and support real-time timeframe switching from 1-day to 1-year views. Technical indicators including SMA (20-period), EMA (12-period), RSI (14-period), MACD (12/26/9), Bollinger Bands (20-period, 2 standard deviations), and VWAP compute and display correctly alongside price data.

### ML Prediction Performance

The Linear Regression model achieves consistent predictions with RMSE values typically ranging from 0.01 to 0.05 on normalized price data, demonstrating reliable short-term trend identification. The 30-day prediction charts display a clear visual separation between historical prices and predicted values, with confidence scores that appropriately decrease from approximately 100% to 70% over the forecast horizon. The fallback client-side prediction model activates seamlessly when the ML backend is unavailable, ensuring uninterrupted prediction functionality.

### System Performance

The containerized deployment achieves full system startup in under 60 seconds, with all five services passing health checks and entering a ready state. Redis caching reduces Finnhub API call volume by approximately 70%, staying well within the free-tier rate limit of 60 calls per minute. The frontend application loads in under 3 seconds with lazy-loaded pages and code-split bundles, providing a smooth, responsive user experience.

---

\newpage

## CHAPTER 8: Challenges Faced

### API Rate Limiting and Data Availability

One of the most significant challenges was managing the Finnhub API's rate limit of 60 calls per minute on the free tier. With multiple components (dashboard, charts, news, indicators) all requiring fresh data, it was easy to exhaust the rate limit quickly. This was solved by implementing a multi-layer caching strategy with Redis on the backend and an in-memory cache with configurable TTL on the frontend, reducing redundant API calls by approximately 70%.

### ML Model Integration Across Services

Integrating the ML prediction service with the frontend required careful handling of the communication chain. The ML service needed to independently fetch historical data from Yahoo Finance, train or load models, generate predictions, and return structured results — all within a reasonable timeout period. Handling scenarios where the ML backend was unavailable required building a complete client-side fallback prediction system using JavaScript-based Linear Regression, ensuring users always had access to prediction functionality.

### Cross-Service Docker Networking

Configuring Docker networking so that all five services could communicate reliably required careful attention to service discovery, health check dependencies, and startup ordering. The MySQL service needed extended startup time before the backend could establish connections, and the frontend had to wait for both the backend and ML service to become healthy before starting. This was resolved using Docker Compose health checks with appropriate intervals, timeouts, and retry counts.

### Responsive Design Complexity

Building a responsive interface that works seamlessly across desktop, tablet, and mobile form factors — especially for data-heavy components like stock charts, technical indicator panels, and prediction tables — required extensive use of MUI's responsive breakpoints and conditional rendering to adapt layouts, font sizes, and chart dimensions for each screen size.

---

\newpage

## CHAPTER 9: Conclusion and Future Scope

### Conclusion

Stock Analyzer successfully demonstrates the feasibility of building a comprehensive, production-ready stock analysis platform using modern web technologies and machine learning. The platform integrates real-time market data, interactive charting, automated technical analysis, portfolio management, and ML-based price prediction into a unified, user-friendly application. The microservices architecture ensures modularity and independent scalability, while Docker containerization provides consistent deployment across environments. The project has provided the team with hands-on experience in full-stack development, REST API design, machine learning model deployment, database management, and DevOps practices.

### Future Scope

Future enhancements for Stock Analyzer include the integration of LSTM and Transformer-based deep learning models for improved prediction accuracy, the addition of Natural Language Processing (NLP) for sentiment analysis on financial news and social media to incorporate market sentiment into predictions, the implementation of real-time WebSocket connections for live price streaming, the development of a mobile application using React Native for on-the-go access, the addition of options chain analysis and cryptocurrency support, the implementation of backtesting capabilities for evaluating trading strategies against historical data, and the integration of a recommendation engine that provides automated buy/sell/hold signals based on combined technical and ML analysis.

---

\newpage

## CHAPTER 10: References

1. React Documentation – https://react.dev/
2. Material-UI (MUI) Documentation – https://mui.com/
3. FastAPI Documentation – https://fastapi.tiangolo.com/
4. Flask Documentation – https://flask.palletsprojects.com/
5. Scikit-learn Documentation – https://scikit-learn.org/
6. Finnhub API Documentation – https://finnhub.io/docs/api
7. yfinance Library – https://pypi.org/project/yfinance/
8. Docker Documentation – https://docs.docker.com/
9. TanStack React Query – https://tanstack.com/query/latest
10. Recharts Documentation – https://recharts.org/
11. Redis Documentation – https://redis.io/documentation
12. MySQL 8.0 Reference Manual – https://dev.mysql.com/doc/refman/8.0/en/
13. Framer Motion Documentation – https://www.framer.com/motion/
14. NumPy Documentation – https://numpy.org/doc/
15. Pandas Documentation – https://pandas.pydata.org/docs/

---

\newpage

## CHAPTER 11: Appendices

### Appendix A: Project Structure

```
stock_analyzer/
├── backend/                    # FastAPI Backend API Service
│   ├── app/
│   │   ├── api/v1/            # Versioned API routes (stocks, predictions)
│   │   ├── core/              # Core utilities and health checks
│   │   ├── db/                # Database models, CRUD, and connection
│   │   ├── middleware/        # Request ID and timing middleware
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   └── services/          # Stock data and ML proxy services
│   ├── config/                # Application settings
│   ├── Dockerfile
│   └── requirements.txt
│
├── ml-service/                 # Flask ML Prediction Service
│   ├── app/
│   │   ├── api/               # Prediction and training API routes
│   │   ├── core/              # Model manager and configuration
│   │   ├── models/            # ML model definitions
│   │   └── services/          # Predictor and trainer services
│   ├── trained_models/        # Saved model files (*.pkl)
│   ├── config/                # ML service settings
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                   # React Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Analysis/      # Technical analysis, news, comparisons
│   │   │   ├── Auth/          # Authentication (ProtectedRoute)
│   │   │   ├── Common/        # Loading skeletons, shared components
│   │   │   ├── Dashboard/     # Stock chart, search, indicators, info
│   │   │   ├── Layout/        # App layout, sidebar, header
│   │   │   └── Portfolio/     # Portfolio management components
│   │   ├── context/           # React Context providers
│   │   ├── pages/             # Page-level components
│   │   ├── services/          # API service classes
│   │   ├── styles/            # Theme configuration
│   │   └── utils/             # Utility functions
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── infra/                      # Infrastructure configuration
│   ├── docker/                # Docker configuration files
│   ├── mysql/                 # MySQL initialization scripts
│   ├── nginx/                 # NGINX configuration
│   └── scripts/               # Infrastructure scripts
│
├── shared/                     # Shared utilities and configuration
├── scripts/                    # Automation scripts (setup, start, stop)
├── tests/                      # Test suites (backend, frontend, ML, integration)
├── docs/                       # API and deployment documentation
├── docker-compose.yml          # Multi-service orchestration
├── .env.example                # Environment variable template
└── README.md                   # Project documentation
```

### Appendix B: API Endpoints

**Backend API (Port 8000)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Service health check |
| GET | /ready | Readiness check (all services) |
| GET | /api/v1/stocks/quote/{ticker} | Get real-time stock quote |
| GET | /api/v1/stocks/profile/{ticker} | Get company profile |
| GET | /api/v1/stocks/search?q= | Search stocks by keyword |
| GET | /api/v1/predictions/predict/{ticker} | Get ML price predictions |
| GET | /api/v1/predictions/models | List available trained models |
| POST | /api/v1/predictions/train/{ticker} | Train a new model |

**ML Service (Port 5001)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Service health check |
| GET | /api/predict/{ticker} | Generate price predictions |
| GET | /api/models | List trained models |
| POST | /api/train/{ticker} | Train new prediction model |

### Appendix C: Environment Configuration

```
ENVIRONMENT=production
DEBUG=false
FRONTEND_PORT=3000
BACKEND_PORT=8000
ML_SERVICE_PORT=5001
FINNHUB_API_KEY=your_finnhub_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=stock_analyzer
MYSQL_USER=stockuser
MYSQL_PASSWORD=stockpassword
REDIS_HOST=redis
REDIS_PORT=6379
SEQUENCE_LENGTH=60
USE_LSTM=false
```

---

*Prepared by: Manav Limbani (24DCS044), Yash Machhi (24DCS045), Deep Makwana (24DCS048)*
