import { invoke } from '@tauri-apps/api/core';

// ============================================================================
// Types
// ============================================================================

export interface DatabaseStats {
    memtable_size_bytes: number;
    wal_size_bytes: number;
    total_tables: number;
    total_rows: number;
    active_transactions: number;
    last_checkpoint_lsn: number;
    uptime_seconds: number;
    version: string;
    active_snapshots: number;
    min_active_timestamp: number;
    garbage_versions: number;
}

export interface ConnectionInfo {
    path: string;
    connected: boolean;
    version: string;
    uptime_seconds: number;
}

export interface ServiceStatus {
    db_connected: boolean;
    mcp_connected: boolean;
    active_mode: string;
}

// Context / Recipes
export interface RecipeSummary {
    id: string;
    name: string;
    version: string;
    description: string;
    tags: string[];
    usage_count: number;
}

export interface RecipeListResponse {
    recipes: RecipeSummary[];
    total: number;
}

export interface SectionSummary {
    name: string;
    priority: number;
    content_type: string;
    estimated_tokens?: number;
}

export interface RecipeDetail {
    id: string;
    name: string;
    version: string;
    description: string;
    query_text: string;
    sections: SectionSummary[];
    token_budget: number;
    session_binding?: string;
    created_at?: string;
    updated_at?: string;
    avg_tokens?: number;
}

export interface RecipeDetailResponse {
    recipe: RecipeDetail;
    versions: string[];
}

export interface SectionAllocation {
    name: string;
    priority: number;
    requested: number;
    allocated: number;
    status: string;
    percentage: number;
    reason: string;
}

export interface BudgetVisualization {
    total_budget: number;
    allocated: number;
    remaining: number;
    sections: SectionAllocation[];
}

export interface ExecutionStep {
    step: number;
    section: string;
    operation: string;
    estimated_tokens: number;
    cumulative_tokens: number;
}

export interface ExplainContextResponse {
    query_text: string;
    budget_allocation: BudgetVisualization;
    execution_plan: ExecutionStep[];
    recommendations: string[];
}

// Policies
export interface CommandPolicy {
    mode: 'ReadOnly' | 'ReadWrite' | 'Restricted' | 'Admin';
    allowed_commands: string[];
    max_memory_mb?: number;
}

export interface PolicyCheck {
    allowed: boolean;
    reason?: string;
}

// MCP
export interface McpTool {
    name: string;
    description?: string;
    inputSchema?: any;
}

export interface McpListToolsResponse {
    tools: McpTool[];
}

export interface McpContent {
    type: 'text' | 'image';
    text?: string;
    data?: string;
    mimeType?: string;
}

export interface McpCallToolResponse {
    content: McpContent[];
    isError?: boolean;
}

// ============================================================================
// API Client
// ============================================================================

// Generic wrapper for type safety
async function call<T>(command: string, args?: Record<string, any>): Promise<T> {
    try {
        return await invoke<T>(command, args);
    } catch (e) {
        console.error(`API Error [${command}]:`, e);
        throw e;
    }
}

export const api = {
    admin: {
        connect: (path: string, mode?: string) => call<ConnectionInfo>('connect', { path, mode }),
        disconnect: () => call<void>('disconnect'),
        getStats: () => call<DatabaseStats>('get_stats'),
        checkpoint: () => call<number>('checkpoint'),
        gc: () => call<number>('gc'),
        compact: () => call<void>('compact'),
        getPolicy: () => call<CommandPolicy>('get_policy'),
        setPolicy: (policy: CommandPolicy) => call<void>('set_policy', { policy }),
        checkCommand: (command: string) => call<PolicyCheck>('check_command', { command }),
        getAllowedCommands: () => call<string[]>('get_allowed_commands'),
        getServiceStatus: () => call<ServiceStatus>('get_service_status'),
    },
    query: {
        execute: (query: string) => call<any>('execute_query', { query }),
        explain: (query: string) => call<string>('explain_query', { query }),
    },
    context: {
        listRecipes: (tags?: string[]) => call<RecipeListResponse>('list_context_recipes', { tags }),
        getRecipe: (recipeId: string, version?: string) => call<RecipeDetailResponse>('get_context_recipe', { recipeId, version }),
        saveRecipe: (recipe: any) => call<string>('save_context_recipe', { request: recipe }),
        explain: (queryText: string) => call<ExplainContextResponse>('explain_context', { queryText }),
        getSessionBudget: (sessionId: string) => call<BudgetVisualization>('get_session_budget', { sessionId }),
        bindRecipe: (recipeId: string, sessionId: string) => call<void>('bind_recipe_to_session', { recipeId, sessionId }),
    },
    mcp: {
        listTools: () => call<McpListToolsResponse | any>('mcp_list_tools'), // Returns dynamic JSON
        callTool: (toolName: string, args: any) => call<McpCallToolResponse | any>('mcp_call_tool', { toolName, arguments: args }),
    },
    llm: {
        // Add LLM commands if needed
    }
};
