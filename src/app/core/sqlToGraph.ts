
import { Parser } from 'node-sql-parser'; // Import the SQL parser
import { v4 as uuidv4 } from 'uuid';
import { GraphNode } from '../types/graphNode';


let myuuid = uuidv4();

const filterTables = (tableList: string[], cteSet: Set<string>) => {
  return tableList.filter((table: string) => {
    const tableName = table.split("::")[2]
    return cteSet.has(tableName);
  })
  .map((table: string) => {
    return table.split("::")[2]
  });
}

// Function to parse SQL and return the AST and any potential `WITH` expressions
export const sqlToGraphNodes = (sqlQuery: string) : GraphNode[] => {
  const parser = new Parser();

  try {
    let ast: any = parser.astify(sqlQuery);
    console.log("ast: ", ast);

    // NOTE: If parser returns a list, first one is ast. 
    //   I don't know why it sometimes returns a list.
    if (0 in ast) {
      ast = ast[0];
    }


    const withs = ast.with || [];
    delete ast.with;
    const withsValues: any[] = Object.values(withs);

    const cteSet = new Set<string>();
    const nodes: GraphNode[] = [];

    for (const withItem of withsValues) {
      // console.log("withItem:", withItem);
      
      const cteName = withItem.name.value;
      const dependsOn = [];
      cteSet.add(cteName);

      const tableList = filterTables(withItem.stmt.tableList, cteSet); 
      const sql = parser.sqlify(withItem.stmt.ast);

      const node: GraphNode = {
        key: cteName,
        sql: sql,
        tables: tableList
      }
        
      // console.log("node:", node);
      nodes.push(node);
    }

    const nodeWithoutCte: GraphNode = {
      key: uuidv4(),
      sql: parser.sqlify(ast),
      tables: ast.from.map((table: any) => table.table)
    };
    
    nodes.push(nodeWithoutCte);

    return nodes;
  } catch (error) {
    console.error("Error parsing SQL:", error);
    return [];
  }
};