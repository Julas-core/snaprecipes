export interface Recipe {
  id?: string;
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  nutrition?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}