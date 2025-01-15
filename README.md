# EY-Intern
This repo contains all the work that was done during the internship .
# Comprehensive AI-Powered Chatbot Project 🚀

This project demonstrates a sophisticated AI-powered chatbot solution with a dynamic web UI, robust backend services, and advanced data scraping capabilities. Designed for seamless interaction and data-driven decision-making, this project integrates cutting-edge technologies in AI, web development, and data engineering.

---

## 🌟 Project Highlights

- **AI-Powered Chatbot**: A smart chatbot leveraging advanced LLMs for context-aware, natural conversations.
- **Retrieval-Augmented Generation (RAG)**: Dynamic data integration for accurate and relevant responses.
- **Secure User Authentication**: Ensures user data privacy with encrypted credentials and JWT-based session management.
- **Data Scraping**: Custom tools for extracting and processing product reviews from Amazon.
- **Scalable Architecture**: Modular components for frontend, backend, and data scraping ensure maintainability and scalability.
- **User-Centric Design**: Responsive UI with light/dark themes tailored for an intuitive user experience.

---

## 🏗️ Project Structure

This repository is organized into three main components:

### **1. Frontend ([ChatBot](ChatBot))**
A sleek and interactive **React-based web application** that includes:
- **Interactive Chat Interface**: Engage with the AI chatbot in real-time.
- **Authentication**: Secure login and signup workflows.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Dark/Light Themes**: User-selectable themes for personalized UX.

**Setup Instructions**:
```bash
cd ChatBot
npm install
npm run dev
```

**Development URL**: [http://localhost:5173](http://localhost:5173)

---

### **2. Backend ([ChatBotBackend](ChatBotBackend))**
A powerful **Flask-based API server** that provides:
- **User Authentication**: Encrypted password storage and JWT-based sessions.
- **RAG Integration**: Combines external data with LLM responses for enhanced context.
- **PostgreSQL Database**: Secure and efficient data storage.
- **LLM Integration**: Connects to a locally hosted LLM for prompt processing.

**Setup Instructions**:
1. Navigate to the backend directory:
   ```bash
   cd ChatBotBackend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

**Environment Variables**: Add the following in a `.env` file:
```env
DB_HOST=localhost
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PWD=your_db_password
SECRET_KEY=your_secret_key
LLM_MODEL=your_locally_installed_llama_model
```

**Start the Server**:
```bash
python backend.py
```

**Development URL**: [http://localhost:5000](http://localhost:5000)

---

### **3. Data Scraping ([DataScraping](DataScraping))**
A specialized module for **extracting and processing Amazon reviews**, Key features include:
- **Login Automation**: Automates Amazon login for data access.
- **Product Filtering**: Scrapes URLs for specific product brands.
- **Review Extraction**: Handles pagination to collect comprehensive review data.
- **CSV Export**: Organizes scraped data into structured CSV files.

**Setup and Usage**:
Detailed instructions can be found in [DataScraping/README.md](DataScraping/README.md).

---

## ⚙️ System Requirements

To run this project, ensure the following dependencies are installed:
- **Node.js** (v18+)
- **Python** (v3.8+)
- **PostgreSQL** (v12+)
- **npm** or **yarn**
- **Git**

---

## 🚀 Development Workflow

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/EY-Intern.git
   cd EY-Intern
   ```

2. Set up each component as per the instructions above.

3. Run the services:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:5000](http://localhost:5000)

---

## 🌐 Project Impact

This project showcases the integration of AI-driven technologies into a scalable web application. It provides a solid foundation for building intelligent systems with advanced data processing and user engagement capabilities.

For any queries or contributions, feel free to reach out or open an issue in the repository. Happy coding! 🎉
```