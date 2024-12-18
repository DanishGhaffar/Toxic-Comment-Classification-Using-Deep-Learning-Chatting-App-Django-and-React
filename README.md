# Toxic-Comment-Classification-Using-Deep-Learning-Chatting-App-Django-and-React

This project is a web-based application that uses a **Django backend** and a **React frontend** to provide real-time messaging functionality. An AI model trained using **BERT Transformer** is integrated to classify messages as either toxic (6 categories) or non-toxic. The application utilizes **Socket.IO** for seamless real-time communication.

## Features

- **Real-Time Communication**: Integrated Socket.IO for instant messaging.
- **AI-Powered Moderation**: Messages are processed by a BERT Transformer model to classify content into the following categories:
  - Toxic
  - Severe Toxic
  - Obscene
  - Threat
  - Insult
  - Identity Hate
  - Non-Toxic
- **Frontend**: Built using React for a responsive and interactive user interface.
- **Backend**: Powered by Django for robust server-side logic and AI model integration.
- **RESTful API**: Facilitates communication between the frontend and backend.

## Technology Stack

### Frontend:
- **React**: For building the user interface.
- **Socket.IO Client**: For real-time communication.

### Backend:
- **Django**: For handling server-side logic and database interactions.
- **Django REST Framework**: For creating RESTful APIs.
- **Socket.IO Server**: For real-time event-driven communication.

### AI/ML:
- **BERT Transformer**: For training the model to classify messages into toxic or non-toxic categories.

### Database:
- **SQLite** (or your chosen database): For storing application data.

## Installation

### Prerequisites:
- Python 3.8+
- Node.js and npm
- Git

### Backend Setup (Django):
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/react-django-ai-chat.git
   cd react-django-ai-chat/backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate   
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Start the backend server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup (React):
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend server:
   ```bash
   npm start
   ```

### Socket.IO Integration:
Ensure that both the Django backend and React frontend are configured to communicate with the Socket.IO server. Update the relevant URLs in the configuration files.

## Usage
1. Open the application in your browser (usually at `http://localhost:3000`).
2. Send a message through the chat interface.
3. The AI model will classify the message as toxic (in one of six categories) or non-toxic.
4. Experience real-time communication with instant message updates.

## AI Model Details
- **Model**: BERT Transformer
- **Purpose**: Classify user messages into toxic (6 categories) or non-toxic.
- **Training**: Pre-trained BERT model fine-tuned on a dataset of labeled messages.
- **Integration**: Model is hosted on the Django backend and processes messages via API calls.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push your changes:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License
This project is licensed under the [MIT License](LICENSE).

## Acknowledgments
- **BERT Transformer**: For its exceptional performance in natural language processing tasks.
- **Socket.IO**: For simplifying real-time communication.
- **Django & React**: For providing robust and scalable development frameworks.

---

Feel free to reach out if you have any questions or feedback!
