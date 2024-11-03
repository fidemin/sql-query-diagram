
"use strict";
"use client";
import { useState, ChangeEvent } from "react";
import { Parser } from 'node-sql-parser';
import { sqlToGraphNodes } from './core/sqlToGraph';
import Graph from './graph';
import { GraphNode } from "./types/graphNode";

export default function Home() {
  const initSql = `WITH cte1 AS (
        SELECT a, b FROM mytable
    ),
    cte2 AS (
        SELECT c FROM table2
    ),
    cte3 AS (
        SELECT cte1.a, cte2.c FROM cte1 INNER JOIN cte2 ON cte1.b = cte2.c
    ),
    final_result AS (
        SELECT cte1.a, cte3.c FROM cte1 INNER JOIN cte3 ON cte1.a = cte3.a
    )
    SELECT * FROM final_result`;

  const initSql2 = `WITH cte1 AS (
    SELECT a, b, COUNT(*) OVER (PARTITION BY a) AS count_a
    FROM mytable
),
cte2 AS (
    SELECT c, d, ROW_NUMBER() OVER (PARTITION BY c ORDER BY d DESC) AS row_num
    FROM table2
    WHERE d > 10
),
cte3 AS (
    SELECT cte1.a, cte2.c, cte1.b
    FROM cte1
    INNER JOIN cte2 ON cte1.b = cte2.c
    WHERE cte1.count_a > 1
),
cte4 AS (
    SELECT a, b, c, SUM(b) OVER (PARTITION BY a) AS sum_b
    FROM (
        SELECT cte3.a, cte3.b, cte3.c
        FROM cte3
        WHERE cte3.c IS NOT NULL
    ) AS filtered_cte3
),
cte5 AS (
    SELECT cte4.a, cte4.c,
           CASE 
               WHEN cte4.sum_b > 100 THEN 'High'
               ELSE 'Low'
           END AS category
    FROM cte4
),
final_result AS (
    SELECT cte1.a, cte5.c, cte5.category, COALESCE(cte1.b, 0) AS b
    FROM cte1
    LEFT JOIN cte5 ON cte1.a = cte5.a
    WHERE cte1.count_a > 2
    UNION ALL
    SELECT a, c, category, b
    FROM cte5
    WHERE category = 'High'
)
SELECT *
FROM final_result
ORDER BY a, c`;

  const [inputValue, setInputValue] = useState<string>(initSql2);
  const [sqlQuery, setSqlQuery] = useState<string>('');

  const [parsedSQL, setParsedSQL] = useState<any>(null);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);

  const parser = new Parser();

  const handleQueryChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    setSqlQuery(inputValue);
    const nodes = sqlToGraphNodes(inputValue);
    setGraphNodes(nodes);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* SQL Input Area */}
      <div className="flex flex-col lg:flex-row w-full max-w-5xl gap-8">
        {/* Textarea for SQL input */}
        <div className="w-full lg:w-1/3">
          <label
            htmlFor="sqlQuery"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            SQL Query:
          </label>
          <textarea
            id="sqlQuery"
            className="mt-2 w-full h-48 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800/30 dark:text-white"
            value={inputValue}
            onChange={handleQueryChange}
            placeholder="Enter your SQL query here..."
          />
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={handleButtonClick}
          >
            Submit Query
          </button>
        </div>
      </div>

      {/* Graph Drawing Area */}
      <div className="w-full lg:flex-1 border-2 border-dashed border-gray-300 rounded-lg bg-white dark:bg-neutral-800/30 flex items-center justify-center text-gray-400 dark:text-gray-600">
        <Graph graphNodes={graphNodes} />
      </div>

      {/* Display the SQL query below the textarea */}
      {sqlQuery && (
        <div className="mt-8 p-4 border border-gray-300 rounded-lg bg-gray-100 dark:bg-neutral-800 dark:text-white">
          <h3 className="text-lg font-medium">Submitted SQL Query:</h3>
          <pre className="mt-2">{sqlQuery}</pre>
        </div>
      )}

      {/* Display the parsed SQL AST */}
      {parsedSQL && (
        <div className="mt-8 p-4 border border-gray-300 rounded-lg bg-gray-100 dark:bg-neutral-800 dark:text-white">
          <h3 className="text-lg font-medium">Parsed SQL (AST):</h3>
          <pre className="mt-2 text-sm overflow-auto">{JSON.stringify(parsedSQL, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}