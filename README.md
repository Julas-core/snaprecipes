# Snap-a-Recipe

> Turn your food photos into delicious recipes!

![App preview GIF](./assets/HowItWorks(1).gif) <!-- Replace with your 10s GIF or screenshot path -->


Snap-a-Recipe is a modern web application that leverages the power of AI to generate detailed recipes from a simple photograph of a meal. Snap a picture with your device's camera or upload an existing image, and let the application create a beautiful, easy-to-follow recipe for you.

##  Features

*   **Recipe Generation Powered by AI**: Utilizes Google Gemini API to identify images related to food and create unique recipes.
*   **Camera and Upload Options**: Allows either capturing new pictures or uploading existing image files.
*   **Image Cropping**: User-friendly cropping and zooming tools to ensure only your picture of the dish gets analyzed.
*   **Recipe Presentation Format**: Easy-to-read layout for recipes that highlights ingredients as well as step-by-step preparation instructions.
*   **Kitchen Mode**: Full-screen view with clear large-font cooking instructions to help you in the kitchen while preparing dishes.
*   **Ingredients Shopping List**: Allows adding ingredients listed on any recipe to an ongoing list to save you time and money.
*   **Multiple Languages Options**: Generates recipes in multiple languages such as English, Spanish, French, German, and Italian.
*   **Print and Share Recipes**: Option to print or copy the text of the recipe to easily share on different devices.
*   **Responsive Design**: Stunning and user-friendly design regardless of whether users are accessing the site through their smartphones or computer.
*   **Work Offline**: The shopping list of ingredients will be saved locally to your browser.

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

The software relies on **Supabase** for authenticating users and persisting their data. The generated AI data is forced to fit a certain TypeScript type (defined in `types.ts`) before saving in the database. As a result, the structure ensures consistency when reading and writing the recipes' metadata.

The main database structure has a table named `recipes` with predefined fields like `recipeName`, `description`, `ingredients` (JSON array), `instructions` (JSON array), `nutrition` (object).


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
    ```

4.  **Run the Project**
   To run this project follow the following steps:
    ```bash
    # Install npm  if you haven't already
    npm install

    # run the project directory
    npm run dev
    ```
    The server will provide a local URL (e.g., `http://localhost:3000`) to open in your browser.

##  Configuration

The only required configuration is the Google Gemini API Key.

*   **`API_KEY`**: This is your secret key for the Gemini API. The application expects this to be available as `process.env.API_KEY`. **Do not expose this key publicly or commit it to version control.**

##  License

This project is licensed under the reative Commons Attribution-NonCommercial 4.0 License.

## Related
you can find the Android version built with kotlin [Here](https://github.com/Julas-core/SnapARecipe-Android-)
