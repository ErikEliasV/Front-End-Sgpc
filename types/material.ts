export interface Material {
  id: string;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  price: number;
  supplier: string;
  location: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialData {
  name: string;
  description: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  price: number;
  supplier: string;
  location: string;
  category: string;
}

export interface UpdateMaterialData extends Partial<CreateMaterialData> {}

export interface MaterialFilters {
  category?: string;
  supplier?: string;
  search?: string;
  lowStock?: boolean;
}

export interface MaterialState {
  materials: Material[];
  currentMaterial: Material | null;
  isLoading: boolean;
  error: string | null;
  filters: MaterialFilters;
} 