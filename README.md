# Snap-a-Recipe

> Turn your food photos into delicious recipes!

![App preview GIF](./assets/Snap%20a%20Recipe%20how%20it%20works.gif) <!-- Replace with your 10s GIF or screenshot path -->

Snap-a-Recipe is a modern web application that leverages the power of AI to generate detailed recipes from a simple photograph of a meal. Snap a picture with your device's camera or upload an existing image, and let the application create a beautiful, easy-to-follow recipe for you.

##  Features

*   **AI-Powered Recipe Generation**: Uses the Google Gemini API to analyze food images and generate unique recipes.
*   **Camera & Upload**: Supports both taking a new photo and uploading an existing image file.
*   **Image Cropping**: An intuitive interface to crop and zoom your image, focusing on the dish for the best results.
*   **Interactive Recipe Display**: A clean, readable layout for recipes, with checkable ingredients and instructions.
*   **Kitchen Mode**: A full-screen, step-by-step guided cooking experience with large text, perfect for use in the kitchen.
*   **Shopping List**: Add ingredients from any recipe to a persistent shopping list to keep track of what you need.
*   **Multi-Language Support**: Generate recipes in various languages including English, Spanish, French, German, and Italian.
*   **Print & Share**: Easily print a clean version of the recipe or share the text content using your device's native share functionality.
*   **Responsive Design**: A beautiful and functional user experience across all devices, from mobile phones to desktops.
*   **Offline Functionality**: The shopping list is saved in your browser's local storage, making it available offline.

##  Technology Stack

*   **Frontend**:
    *   **Framework**: [React](https://reactjs.org/)
    *   **Language**: [TypeScript](https://www.typescriptlang.org/)
    *   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS workflow.
*   **AI Model**:
    *   [Google Gemini API (`gemini-2.5-flash`)](https://ai.google.dev/) for multimodal input and structured JSON output.
*   **Core Libraries**:
    *   `@google/genai`: The official SDK for interacting with the Gemini API.
    *   `react-easy-crop`: For the image cropping component.
*   **Deployment**: The application is a static single-page application (SPA) that can be served by any static file host.

##  Data Architecture

The application uses **Supabase** for user authentication and persistence. AI output is coerced into a defined TypeScript interface (see `types.ts`) before being saved to the database, ensuring data integrity and queryability. This structured approach means the recipes, nutrition facts, and related metadata stay consistent and reliable across reads and writes.

<<<<<<< HEAD
The primary database schema consists of a `recipes` table with structured fields (for example: `recipeName`, `description`, `ingredients` as a JSON array, `instructions` as a JSON array, and `nutrition` as an object).

=======
>>>>>>> 90c9708af2133a6a3028c6284c4308783fad4aec
## AI Pipeline (Gemini)

Key excerpt from `services/geminiService.ts` showing how the Gemini request is structured and validated:

```ts
const imageParts = imageData.match(/^data:(.+);base64,(.+)$/);
const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
        parts: [
            { inlineData: { data: base64ImageData, mimeType } },
            { text: `Analyze the food in this image and generate a detailed recipe in ${language}... Ensure the response is in JSON format.` },
        ],
    },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                recipeName: { type: Type.STRING },
                description: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                nutrition: {
                    type: Type.OBJECT,
                    properties: {
                        calories: { type: Type.STRING },
                        protein: { type: Type.STRING },
                        carbs: { type: Type.STRING },
                        fat: { type: Type.STRING },
                    },
                    required: ["calories", "protein", "carbs", "fat"],
                },
            },
            required: ["recipeName", "description", "ingredients", "instructions", "nutrition"],
        },
    },
});

const recipeData = JSON.parse(response.text.trim()); // Coerces AI output into the Recipe interface
```

##  Future Enhancements

*   User rating system for generated recipes.
*   All generated recipes visible to all users unless explicitly marked private by their creators.
*   Advanced search and filtering by ingredient, diet, and prep time.

##  Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

*   A modern web browser that supports the Camera API (e.g., Chrome, Firefox, Safari).
*   A valid **Google Gemini API Key**. You can obtain one from the [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Running the App

This project is designed to be run in an environment where environment variables are managed for you. To run it locally, you would typically:

1.  **Clone the repository (if applicable):**
    ```bash
    git clone https://github.com/your-username/snap-a-recipe.git
    cd snaprecipes
    ```

2.  **Set up the API Key:**
    The application is configured to look for the API key in `process.env.API_KEY`. You will need to use a tool that can inject this environment variable into your static files during a build process or when serving.
    
3. **Installing node:**
    To install Node.js, download it from [nodejs.org](https://nodejs.org/) and follow the installer prompts. After installation, verify with:
    ```bash
    node -v
    npm -v
    ```

4.  **Serve the application:**
    Since this is a static React application, you can serve the `index.html` file using any local web server. For example, using `serve`:
    ```bash
    # Install serve globally if you haven't already
    npm install -g serve

    # Serve the project directory
    serve .
    ```
    The server will provide a local URL (e.g., `http://localhost:3000`) to open in your browser.

##  Configuration

The only required configuration is the Google Gemini API Key.

*   **`API_KEY`**: This is your secret key for the Gemini API. The application expects this to be available as `process.env.API_KEY`. **Do not expose this key publicly or commit it to version control.**

##  License

This project is licensed under the MIT License.
