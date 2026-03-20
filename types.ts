export enum Unit {
  KG = 'Kg',
  GR = 'Gr',
  LT = 'Lt',
  UN = 'Un'
}

export interface Ingredient {
  id: string;
  userId: string;
  name: string;
  unit: Unit;
  quantity?: number;
  currentStock?: number; // Actual stock on hand
  pricePerUnit: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  type?: 'ingredient' | 'recipe'; // 'ingredient' for standard ingredients, 'recipe' for sub-recipes
  quantityUsed: number; // In grams if KG/LT, or units if UN
  calculatedCost: number;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Recipe {
  id: string;
  userId: string;
  name: string;
  ingredients: RecipeIngredient[];
  totalYieldWeight: number;
  totalCost: number;
  costPerGram: number;
  nutritionalInfo?: NutritionalInfo;
  portionWeight?: number;
  conservation?: string;
  isPromo?: boolean;
  promoItems?: PromoItem[];
  isIngredient?: boolean;
  // Catalog fields
  showInCatalog?: boolean;
  catalogPrice?: number;
  catalogDescription?: string;
  catalogImage?: string;
  catalogImages?: string[];
  catalogOrder?: number;
}

export interface PromoItem {
  recipeId: string;
  quantityUsed: number; // amount of the recipe used
  calculatedCost: number;
}

// Helper to convert units for display/calculation
// We assume:
// If Unit is KG, input is in Grams. (Factor 1000)
// If Unit is LT, input is in ML. (Factor 1000)
// If Unit is GR, input is in Grams. (Factor 1)
// If Unit is UN, input is in Units. (Factor 1)
export const getConversionFactor = (unit: Unit): number => {
  switch (unit) {
    case Unit.KG: return 1000;
    case Unit.LT: return 1000;
    case Unit.GR: return 1;
    case Unit.UN: return 1;
    default: return 1;
  }
};

export interface Client {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  id: string;
  name: string; // "Cheesecake Keto"
  amount: number; // 200
  unit: string; // "gr/ml/un"
  quantity: number; // 1
  price: number; // 3555
}

export interface Order {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  deliveryDate: Date;
  deliveryTime?: string;
  status: 'pending' | 'completed' | 'canceled';
  total: number;
  deposit: number;
  createdAt: Date;
  // Catalog order fields
  source?: 'admin' | 'catalog';
  clientPhone?: string;
  clientAddress?: string;
  clientNotes?: string;
  isRead?: boolean;
}

// Production History Log
export interface ProductionLog {
  id: string;
  userId: string;
  recipeId: string;
  recipeName: string;
  quantityProduced: number; // in grams
  date: any; // Firestore Timestamp
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background1: string;
  background2: string;
  textMain: string;
  textMuted: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  companyName: string;
  instagram: string;
  facebook: string;
  themeColors?: ThemeColors;
  logoUrl?: string;
}