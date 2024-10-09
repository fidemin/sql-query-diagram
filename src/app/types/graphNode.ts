// Define the type for a single graph node
export type GraphNode = {
    key: string;   // Unique key for the node (UUID or cte name)
    sql: string;   // The SQL representation for the node
    tables: string[];  // List of tables this node depends on
};