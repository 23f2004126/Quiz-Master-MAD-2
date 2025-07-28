# Quiz Master V2

A full-stack web application designed as an exam preparation platform with multi-user support, featuring distinct roles for Admins and Users.

## 🎯 Overview

Quiz Master V2 is built with a modern, decoupled architecture using a Flask-based API backend and a dynamic Vue.js frontend. It leverages Redis for high-performance caching and background job processing with Celery, and uses MailHog for development email testing.

## ✨ Features

### 👤 For Users
- **User Registration & Login**: Secure account creation and authentication
- **Personal Dashboard**: Summary statistics (quizzes taken, average score, highest score) with performance graphs
- **Guided Quiz Flow**: Select subject → chapter → quiz
- **Timed Quizzes**: Each quiz has a specific duration with live countdown timer
- **Profile Management**: View and manage registered profile details
- **CSV Export**: Asynchronous export of scores, delivered via email
- **Automated Reports**: Monthly performance reports and reminder emails

### 🔧 For Admins
- **Admin Dashboard**: Central hub for managing the entire application
- **Platform Analytics**: Overview of platform-wide data with graphical charts
- **Full CRUD Operations**: Create, Read, Update, and Delete:
  - Subjects
  - Chapters
  - Quizzes
  - Questions
- **Live Search**: Instantly filter content across all management sections
- **User Data Export**: Generate CSV reports of all users' performance statistics

## 🛠 Technology Stack

### Backend
- **Framework**: Flask
- **Database**: SQLite (automatically created)
- **Caching & Message Broker**: Redis
- **Background Jobs**: Celery
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Flask-Mail

### Frontend
- **Framework**: Vue.js (CDN-based, no build step)
- **UI & Styling**: Bootstrap 5
- **Routing**: Vue Router
- **Charts**: Chart.js

### Development Tools
- **Email Testing**: MailHog
- **Environment**: Python venv
- **Package Management**: pip

## 🚀 Installation & Setup

### Prerequisites
- Python 3.7+
- Redis server
- MailHog (for email testing)

### Phase 1: Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <your-repository-url>
   cd quiz-master-v2
   ```

2. **Create Virtual Environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**
   
   Create a `.env` file in the project root:
   ```ini
   FLASK_SECRET_KEY='19102003'
   JWT_SECRET_KEY='19102003'
   DATABASE_URL='sqlite:///quizmaster.db'
   REDIS_URL='redis://localhost:6379/0'
   CELERY_BROKER_URL='redis://localhost:6379/1'
   CELERY_RESULT_BACKEND='redis://localhost:6379/2'
   ADMIN_EMAIL='admin@quizmaster.com'
   ADMIN_PASSWORD='StrongAdminPassword123'
   
   # Email Configuration for MailHog
   MAIL_SERVER=localhost
   MAIL_PORT=1025
   MAIL_USE_TLS=False
   MAIL_USE_SSL=False
   MAIL_DEFAULT_SENDER="Quiz Master Admin <admin@quizmaster.com>"
   ```
   
   ⚠️ **Important**: Replace the secret keys with unique, randomly generated strings.

5. **Install Background Services**
   
   **Using Homebrew (macOS):**
   ```bash
   # Install services
   brew install redis mailhog
   
   # Start as background services

   brew services start redis
   redis-server
   brew services start mailhog
   mailhog

   ```
   
   **Using Docker (Alternative):**
   ```bash
   # Redis
   docker run -d -p 6379:6379 redis:alpine
   
   # MailHog
   docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
   ```

### Phase 2: Running the Application

The application requires **three separate terminal windows** running simultaneously:

#### Terminal 1: Celery Worker
```bash
celery -A celery_worker.celery worker --loglevel=info -P eventlet
```

#### Terminal 2: Celery Beat Scheduler
```bash
celery -A celery_worker.celery beat --loglevel=info
```

#### Terminal 3: Flask Web Server
```bash
python3 run.py
```
#### Terminal 4: redis
```bash
  redis-server
```
#### Terminal 5: mailhog
```bash
mailhog
```
*Note: On first run, this will automatically create and initialize the `quizmaster.db` database.*

## 🌐 Access Points

- **Web Application**: http://127.0.0.1:5000
- **Email Interface (MailHog)**: http://localhost:8025
- **Admin Login**: Use credentials from your `.env` file

## 🛑 Stopping the Application

1. Press `Ctrl + C` in each of the three terminal windows
2. Background services (Redis, MailHog) will continue running
3. To stop background services:
   ```bash
   brew services stop redis
   brew services stop mailhog
   ```

## 📁 Project Structure

```
quiz-master-v2/
├── README.md
├── requirements.txt
├── .env
├── run.py
├── celery_worker.py
├── app/
│   ├── __init__.py
│   ├── models/
│   ├── routes/
│   ├── templates/
│   └── static/
└── quizmaster.db (auto-generated)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Redis Connection Error**
- Ensure Redis is running: `brew services start redis`
- Check if port 6379 is available

**Email Not Sending**
- Verify MailHog is running: `brew services start mailhog`
- Check MailHog UI at http://localhost:8025

**Database Issues**
- Delete `quizmaster.db` and restart Flask to recreate
- Check file permissions in project directory

**Celery Worker Not Starting**
- Ensure Redis is running first
- Try installing eventlet: `pip install eventlet`

## 📞 Support

For support, email admin@quizmaster.com or create an issue in this repository.