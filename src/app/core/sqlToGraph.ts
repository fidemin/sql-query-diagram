
import { Parser } from 'node-sql-parser'; // Import the SQL parser
import { v4 as uuidv4 } from 'uuid';


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
export const sqlToGraphNodes = (sqlQuery: string) => {
  const parser = new Parser();

  try {
    const ast: any = parser.astify(sqlQuery);
    console.log("any: ", ast);
    const withs = ast.with || [];
    delete ast.with;
    const withsValues: any[] = Object.values(withs);

    const cteSet = new Set<string>();
    const nodes: any[] = [];

    for (const withItem of withsValues) {
      console.log("withItem:", withItem);
      
      const cteName = withItem.name.value;
      const dependsOn = [];
      cteSet.add(cteName);

      const tableList = filterTables(withItem.stmt.tableList, cteSet); 
      const sql = parser.sqlify(withItem.stmt.ast);

      const node: any = {};
      node.key = cteName;
      node.sql = sql;
      node.tables = tableList;
      console.log("node:", node);
      nodes.push(node);
    }

    const nodeWithoutCte: any = {
    };
    
    // uuid key for nodeWithoutCte
    nodeWithoutCte.key = uuidv4();
    nodeWithoutCte.sql = parser.sqlify(ast);
    nodeWithoutCte.tables = ast.from.map((table: any) => table.table);
    console.log("nodeWithoutCte:", nodeWithoutCte);
    nodes.push(nodeWithoutCte);

    return nodes;
  } catch (error) {
    console.error("Error parsing SQL:", error);
    return [];
  }
};