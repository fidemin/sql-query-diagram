
"use strict";
"use client";
import { useState, ChangeEvent } from "react";
import { Parser } from 'node-sql-parser'; 
import { sqlToGraphNodes } from './core/sqlToGraph'; 

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

  const [inputValue, setInputValue] = useState<string>(initSql);
  const [sqlQuery, setSqlQuery] = useState<string>('');

  const [parsedSQL, setParsedSQL] = useState<any>(null);

  const parser = new Parser();

  const handleQueryChange = (e:  ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    setSqlQuery(inputValue);
    const nodes = sqlToGraphNodes(inputValue);
    console.log(nodes);
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

        {/* Placeholder for future drawing area */}
        <div className="w-full lg:flex-1 border-2 border-dashed border-gray-300 rounded-lg bg-white dark:bg-neutral-800/30 flex items-center justify-center text-gray-400 dark:text-gray-600">
          {/* Placeholder for any future visualizations */}
          Drawing Area (Placeholder)
        </div>
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