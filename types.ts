export interface Recipe {
  id?: string;
  recipeName: string;
  premiumName?: string;
  chefVibe?: 'Rustic' | 'Elegant' | 'Fiery' | 'Fresh' | 'Modern';
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