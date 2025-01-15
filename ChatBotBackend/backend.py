import os
import psycopg2
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import jwt as pyjwt
from datetime import datetime, timedelta
from functools import wraps
from llm_api import get_llm_response
from flask_cors import CORS, cross_origin
from simple_rag import get_answer
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')


def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PWD')
    )
    return conn


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            data = jwt.decode(
                token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated


@app.route("/")
def helloWorld():
    return "Hello world"


@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        username = data['username']
        email = data['email']
        password = data['password']
        first_name = data.get('first_name')
        last_name = data.get('last_name')

        password_hash = generate_password_hash(password)

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('''
            INSERT INTO users (username, email, password_hash, first_name, last_name)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id;
        ''', (username, email, password_hash, first_name, last_name))

        user_id = cur.fetchone()[0]
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({'message': 'User created successfully', 'user_id': user_id}), 201

    except psycopg2.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    username = str(data.get('username'))
    password = str(data.get('password'))

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT * FROM users WHERE username = %s', (username,))
        user = cur.fetchone()

        if user and check_password_hash(user[3], password):
            payload = {
                'user_id': str(user[0]),
                'username': str(user[1]),
                'exp': datetime.utcnow() + timedelta(days=1)
            }

            secret_key = str(app.config['SECRET_KEY'])

            try:
                token = pyjwt.encode(
                    payload,
                    secret_key,
                    algorithm="HS256"
                )

            except Exception as jwt_error:
                print("JWT encoding error:", str(jwt_error))
                return jsonify({'error': f'Token generation failed: {str(jwt_error)}'}), 500

            # Update last login
            cur.execute(
                'UPDATE users SET last_login = %s WHERE id = %s',
                (datetime.now(), user[0])
            )
            conn.commit()

            return jsonify({
                'token': token,
                'user': {
                    'id': str(user[0]),
                    'username': str(user[1]),
                    'email': str(user[2])
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        print("Login error:", str(e))  # Debug line
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()


@app.route('/api-keys', methods=['POST'])
@token_required
def store_api_key(current_user_id):
    try:
        data = request.get_json()
        api_key_name = data['key_name']
        api_key_value = data['key_value']
        provider = data['provider']

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('''
            INSERT INTO api_keys (user_id, api_key_name, api_key_value, provider)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
        ''', (current_user_id, api_key_name, api_key_value, provider))

        api_key_id = cur.fetchone()[0]
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            'message': 'API key stored successfully',
            'api_key_id': api_key_id
        }), 201

    except psycopg2.IntegrityError:
        return jsonify({'error': 'API key name already exists for this user'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/chatbot/signup', methods=['POST'])
def chatbot_signup():
    try:
        data = request.get_json()
        username = data['username']
        email = data['email']
        password = data['password']

        password_hash = generate_password_hash(password)

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('''
            INSERT INTO chatbot_users (username, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING id;
        ''', (username, email, password_hash))

        user_id = cur.fetchone()[0]

        # Generate JWT token
        token = pyjwt.encode({
            'user_id': str(user_id),
            'username': str(username),
            'exp': datetime.utcnow() + timedelta(days=1)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'message': 'Chatbot user created successfully',
            'token': token,
            'user_id': user_id
        }), 201

    except psycopg2.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/chatbot/login', methods=['POST'])
def chatbot_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            'SELECT * FROM chatbot_users WHERE username = %s', (username,))
        user = cur.fetchone()

        if user and check_password_hash(user[3], password):
            # Generate JWT token
            token = pyjwt.encode({
                'user_id': user[0],
                'username': user[1],
                'exp': datetime.utcnow() + timedelta(days=1)
            }, app.config['SECRET_KEY'], algorithm="HS256")

            # Update last login
            cur.execute(
                'UPDATE chatbot_users SET last_login = %s WHERE id = %s',
                (datetime.now(), user[0])
            )
            conn.commit()

            return jsonify({
                'token': token,
                'user': {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2]
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()
# @app.route('/chat', methods=['POST'])
# @token_required
# def chat(current_user_id):
#     try:
#         data = request.get_json()
#         prompt = data['prompt']
#         conversation_id = data.get('conversation_id')

#         conn = get_db_connection()
#         cur = conn.cursor()

#         cur.execute('SELECT api_key_value FROM api_keys WHERE user_id = %s AND provider = %s',
#                    (current_user_id, 'huggingface'))
#         api_key = cur.fetchone()[0]

#         # Get LLM response
#         response = get_llm_response(api_key, prompt)
#         current_time = datetime.utcnow().isoformat()

#         if conversation_id:
#             # Update existing conversation
#             cur.execute('''
#                 UPDATE chat_messages
#                 SET message_data = jsonb_set(
#                     message_data,
#                     '{messages}',
#                     (message_data->'messages') || jsonb_build_array(
#                         jsonb_build_object(
#                             'sender_type', 'user',
#                             'time', %s,
#                             'message', %s
#                         ),
#                         jsonb_build_object(
#                             'sender_type', 'bot',
#                             'time', %s,
#                             'message', %s
#                         )
#                     )
#                 )
#                 WHERE conversation_id = %s
#                 RETURNING conversation_id;
#             ''', (current_time, prompt, current_time, response, conversation_id))
#         else:
#             # Create new conversation
#             message_data = {
#                 "messages": [
#                     {
#                         "sender_type": "user",
#                         "time": current_time,
#                         "message": prompt
#                     },
#                     {
#                         "sender_type": "bot",
#                         "time": current_time,
#                         "message": response
#                     }
#                 ]
#             }
#             cur.execute('''
#                 INSERT INTO chat_messages (user_id, message_data)
#                 VALUES (%s, %s)
#                 RETURNING conversation_id;
#             ''', (current_user_id, json.dumps(message_data)))

#         conversation_id = cur.fetchone()[0]
#         conn.commit()
#         cur.close()
#         conn.close()

#         return jsonify({
#             'response': response,
#             'conversation_id': conversation_id
#         }), 200

#     except Exception as e:
#         return jsonify({'error': str(e)}), 400


@app.route('/simple-chat', methods=['POST'])
def simple_chat():
    try:
        data = request.get_json()
        prompt = data['prompt']

        # Get LLM response using the default key
        response = get_answer(prompt)

        return jsonify({
            'response': response
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)
