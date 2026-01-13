export interface ContextRecipe {
    id: string;
    name: string;
    version: string;
    tags: string[];
    token_budget: number;
    query_text: string;
    created_at: string;
    updated_at: string;
}

const SAMPLE_RECIPES: ContextRecipe[] = [
    {
        id: '1',
        name: 'Support Agent Base',
        version: '1.0.0',
        tags: ['support', 'customer-service'],
        token_budget: 4000,
        query_text: `SELECT * FROM users WHERE id = $user_id;\nSELECT * FROM recent_orders WHERE user_id = $user_id LIMIT 5;`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        name: 'Analyze Spending',
        version: '0.1.0-alpha',
        tags: ['finance', 'analysis'],
        token_budget: 8000,
        query_text: `SELECT * FROM transactions WHERE date > '2023-01-01';`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

class RecipeStore {
    private recipes: ContextRecipe[] = SAMPLE_RECIPES;
    private listeners: (() => void)[] = [];

    getRecipes(): ContextRecipe[] {
        return this.recipes;
    }

    getRecipe(id: string): ContextRecipe | undefined {
        return this.recipes.find(r => r.id === id);
    }

    addRecipe(recipe: ContextRecipe) {
        this.recipes.push(recipe);
        this.notify();
    }

    updateRecipe(id: string, updates: Partial<ContextRecipe>) {
        const index = this.recipes.findIndex(r => r.id === id);
        if (index !== -1) {
            this.recipes[index] = { ...this.recipes[index], ...updates, updated_at: new Date().toISOString() };
            this.notify();
        }
    }

    deleteRecipe(id: string) {
        this.recipes = this.recipes.filter(r => r.id !== id);
        this.notify();
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(l => l());
    }
}

export const recipeStore = new RecipeStore();
