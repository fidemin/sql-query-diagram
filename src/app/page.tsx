"use client"
import { useState, ChangeEvent } from "react";

export default function Home() {
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const handleQueryChange = (e:  ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    setSqlQuery(inputValue);
    console.log('SQL Query:', sqlQuery);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Header Section */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row w-full max-w-5xl gap-8">
        {/* Textarea for SQL input */}
        <div className="w-full lg:w-1/3">
          <label htmlFor="sqlQuery" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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

        {/* Placeholder for drawing area */}
        <div className="w-full lg:flex-1 border-2 border-dashed border-gray-300 rounded-lg bg-white dark:bg-neutral-800/30 flex items-center justify-center text-gray-400 dark:text-gray-600">
          {/* This area will be used for drawing later */}
          Drawing Area (Placeholder)
        </div>
      </div>
    </main>
  );
}