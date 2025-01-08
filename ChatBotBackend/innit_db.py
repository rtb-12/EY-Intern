import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PWD')
)

# Open a cursor to perform database operations
cur = conn.cursor()

# Execute commands: create users table
cur.execute('DROP TABLE IF EXISTS users;')
cur.execute('''
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    );
''')

# Create user_sessions table for managing login sessions
cur.execute('DROP TABLE IF EXISTS user_sessions;')
cur.execute('''
    CREATE TABLE user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        session_token VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
''')

# Create API keys table
cur.execute('DROP TABLE IF EXISTS api_keys;')
cur.execute('''
    CREATE TABLE api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        api_key_name VARCHAR(50) NOT NULL,
        api_key_value VARCHAR(255) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, api_key_name)
    );
''')

# Create chat messages table with JSONB array
cur.execute('DROP TABLE IF EXISTS chat_messages;')
cur.execute('''
    CREATE TABLE chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        conversation_id UUID DEFAULT gen_random_uuid(),
        message_data JSONB NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_conversation_id ON chat_messages(conversation_id);
    CREATE INDEX idx_message_data ON chat_messages USING GIN (message_data);
''')

conn.commit()

cur.close()
conn.close()