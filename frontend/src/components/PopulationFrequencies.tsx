"use client";

import type React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Frequency } from "../api";

interface PopulationFrequenciesProps {
  freqs: Frequency[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
}

export const PopulationFrequencies: React.FC<PopulationFrequenciesProps> = ({
  freqs,
  currentPage,
  setCurrentPage,
  pageSize,
}) => {
  const totalPages = Math.max(1, Math.ceil(freqs.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const pageData = freqs.slice(start, start + pageSize);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Sample
              </th>
              <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Total Count
              </th>
              <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Population
              </th>
              <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Count
              </th>
              <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((f, index) => {
              const absoluteIndex = start + index;

              const isGroupBorder = (absoluteIndex + 1) % 5 === 0;
              const isNotLastRow = index < pageData.length - 1;

              return (
                <tr
                  key={`${f.sample}-${f.population}`}
                  className={`hover:bg-slate-700/50 transition-colors ${
                    isGroupBorder
                      ? "border-b-2 border-orange-400"
                      : isNotLastRow
                      ? "border-b border-slate-700"
                      : ""
                  }`}
                >
                  <td className="px-3 sm:px-6 py-4 text-sm font-medium text-white">
                    {f.sample}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {f.total_count}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {f.population}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {f.count}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-orange-400 font-semibold">
                    {f.percentage.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-slate-700 px-3 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-300">
          Page
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              let v = Number.parseInt(e.target.value, 10) || 1;
              v = Math.min(Math.max(1, v), totalPages);
              setCurrentPage(v);
            }}
            className="w-16 text-center bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white"
          />
          of {totalPages}
        </div>

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
