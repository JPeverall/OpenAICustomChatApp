# Chat App with OpenAI Integration - README

## Try it out [here](https://jaesolutions.tech/chat) and make your contributions.

## Overview
This Chat App is a comprehensive solution integrating OpenAI's GPT-4 API and a custom image generation module using the Stable Diffusion model. It's built with a React frontend, Express.js backend, and a FastAPI Python server for image generation.

## Features
- Interactive chat interface with GPT-4 (or other models).
- Dynamic image generation based on chat inputs.
- Typewriter effect for bot responses.
- Auto-scrolling for new messages.
- CORS support for secure cross-origin requests.
- Environment variable management for sensitive keys.
- Automatic mixed precision training for image generation.

## Frontend (React)
### Dependencies
- `react`: UI library for building the interface.
- `use-state`: For managing state within components.
- `use-effect`, `use-ref`, `use-callback`, `use-memo`: React hooks for lifecycle and performance optimizations.

### Key Components
- `Chat`: Main component managing chat UI and interactions.
- `useState`: For managing chat messages, bot responses, images, API responses, and UI states.
- `useRef`: For referencing DOM elements like input field and message container.
- `useCallback`: For memoizing functions to avoid unnecessary re-renders.
- `useEffect`: For side effects like fetching data, attaching event listeners, and auto-scrolling.

## Backend (Express.js)
### Dependencies
- `express`: Web framework for handling HTTP requests.
- `cors`: Middleware for enabling Cross-Origin Resource Sharing.
- `dotenv`: For loading environment variables.
- `openai`: SDK for integrating with OpenAI's GPT-4 API.
- `fetch`: For making HTTP requests to external APIs.

### Endpoints
- `/api`: Handles requests to OpenAI's GPT-4 API.
- `/api/get-image`: Fetches generated images based on prompts.
   - In my use case, this endpoint sends a request to a [FastAPI Python server](https://github.com/JPeverall/SDServer) for generation of custom images on a local PC, but you can use another API, such as the [DALL-E API](https://openai.com/blog/dall-e-api-now-available-in-public-beta) for web-based image generation.

## Image Generation Server (FastAPI with Python)
### Dependencies
- `fastapi`: Framework for building APIs.
- `nltk`: Natural Language Toolkit for text processing.
- `torch`: PyTorch, a deep learning framework.
- `diffusers`: For stable diffusion image generation.
- `base64`: For encoding images in Base64 format.

### Features
- Stable Diffusion model for generating images based on prompts.
- Autocast for automatic mixed precision training.
- Custom prompt extraction and processing.

## Installation & Setup
1. **Clone the repository:** 
   ```bash
   git clone https://github.com/JPeverall/OpenAICustomChatApp.git
   ## Installation & Setup

2. **Install dependencies:**
   - **Frontend (React):**
     ```bash
     cd frontend
     npm install -g create-react-app
     ```
   - **Backend (Express.js):**
     ```bash
     cd backend
     npm install express
     ```
   - **Image Generation Server (Python):**
     - Follow instructions [here](https://github.com/JPeverall/SDServer).

3. **Setting Environment Variables:**
   - Create `.env` files in both backend and image-server directories.
   - Add your OpenAI API key and other sensitive keys.
   - If utilizing a cloud hosting service (mine is running on Azure Web Apps), you **MUST** add the environmental variables to the configuration in your Web App.

4. **Running the Application:**
   - **Start the frontend:**
     ```bash
     npm start
     ```
   - **Start the backend server:**
     ```bash
     node app.js
     ```
   - **Start the image generation server:**
     ```bash
     uvicorn main:app --reload
     ```

## Usage

1. **Chat Interaction:**
   - Type messages in the input field and press Enter.
   - The app will display responses from GPT-4 and images based off the GPT response text.

2. **Customization:**
   - Modify the system prompt in the frontend to change initial instructions to GPT-4.
   - Adjust image generation prompts in the backend Python server.

## Contribution

Contributions are welcome. Please fork the repository and submit pull requests with your improvements.
