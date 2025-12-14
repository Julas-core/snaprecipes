export interface Recipe {
  id?: string;
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
}