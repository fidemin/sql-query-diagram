
import { Parser } from 'node-sql-parser'; // Import the SQL parser

// Function to parse SQL and return the AST and any potential `WITH` expressions
export const sqlToGraph = (sqlQuery: string) => {
  const parser = new Parser();

  try {
    const ast = parser.astify(sqlQuery);

    const withs = (ast as any)?.with || [];
    const withsValues: any[] = Object.values(withs);

    const cteSet = new Set<string>();
    const graph: any[] = [];

    for (const withItem of withsValues) {
      console.log("withItem:", withItem);
      
      const cteName = withItem.name.value;
      const dependsOn = [];
      cteSet.add(cteName);

      const tableList = withItem.stmt.tableList.filter((table: string) => {
        const tableName = table.split("::")[2]
        return cteSet.has(tableName);
      })
      .map((table: string) => {
        return table.split("::")[2]
      });

      const sql = parser.sqlify(withItem.stmt.ast);

      const node: any = {};
      node.cteName = cteName;
      node.sql = sql;
      node.tables = tableList;
      console.log("node:", node);
      graph.push(node);
    }

    return graph;
  } catch (error) {
    console.error("Error parsing SQL:", error);
    return [];
  }
};