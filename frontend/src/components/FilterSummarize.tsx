"use client"

import type React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { FilterParams, FilterSummary, Sample } from "../api"

interface FilterSummarizeProps {
  filterParams: FilterParams
  setFilterParams: (params: FilterParams) => void
  filterSummary: FilterSummary | null
  filterSamples: Sample[]
  filterPage: number
  setFilterPage: (page: number) => void
  pageSize: number
  applyFilters: () => void
}

export const FilterSummarize: React.FC<FilterSummarizeProps> = ({
  filterParams,
  setFilterParams,
  filterSummary,
  filterSamples,
  filterPage,
  setFilterPage,
  pageSize,
  applyFilters,
}) => {
  const totalPages = Math.max(1, Math.ceil(filterSamples.length / pageSize))
  const start = (filterPage - 1) * pageSize
  const pageData = filterSamples.slice(start, start + pageSize)

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Filter Controls */}
      <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Filter Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Condition</label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filterParams.condition || ""}
              onChange={(e) =>
                setFilterParams({
                  ...filterParams,
                  condition: e.target.value || undefined,
                })
              }
            >
              <option value="">Any</option>
              <option value="melanoma">melanoma</option>
              <option value="carcinoma">carcinoma</option>
              <option value="healthy">healthy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Treatment</label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filterParams.treatment || ""}
              onChange={(e) =>
                setFilterParams({
                  ...filterParams,
                  treatment: e.target.value || undefined,
                })
              }
            >
              <option value="">Any</option>
              <option value="miraclib">miraclib</option>
              <option value="phauximab">phauximab</option>
              <option value="">none</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sample Type</label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filterParams.sample_type || ""}
              onChange={(e) =>
                setFilterParams({
                  ...filterParams,
                  sample_type: e.target.value || undefined,
                })
              }
            >
              <option value="">Any</option>
              <option value="PBMC">PBMC</option>
              <option value="WB">WB</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Time From Start</label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filterParams.time_from_treatment_start?.toString() || ""}
              onChange={(e) =>
                setFilterParams({
                  ...filterParams,
                  time_from_treatment_start: e.target.value ? Number.parseInt(e.target.value, 10) : undefined,
                })
              }
            >
              <option value="">Any</option>
              <option value="0">0</option>
              <option value="7">7</option>
              <option value="14">14</option>
            </select>
          </div>
        </div>
        <button
          onClick={applyFilters}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Apply Filters
        </button>
      </div>

      {/* Summary Cards */}
      {filterSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Samples by Project</h3>
            <div className="space-y-2">
              {Object.entries(filterSummary.samples_by_project).map(([proj, cnt]) => (
                <div key={proj} className="flex justify-between items-center">
                  <span className="text-slate-300">{proj}</span>
                  <span className="text-orange-500 font-semibold">{cnt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Subjects by Response</h3>
            <div className="space-y-2">
              {Object.entries(filterSummary.subjects_by_response).map(([resp, cnt]) => (
                <div key={resp} className="flex justify-between items-center">
                  <span className="text-slate-300">{resp}</span>
                  <span className="text-orange-500 font-semibold">{cnt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Subjects by Sex</h3>
            <div className="space-y-2">
              {Object.entries(filterSummary.subjects_by_sex).map(([sex, cnt]) => (
                <div key={sex} className="flex justify-between items-center">
                  <span className="text-slate-300">{sex}</span>
                  <span className="text-orange-500 font-semibold">{cnt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtered Samples Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Sample ID
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Sex
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Treatment
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Response
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Time From Start
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {pageData.map((s) => (
                <tr key={s.sample_id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm font-medium text-white">{s.sample_id}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">{s.project}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">{s.subject}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">{s.condition || "-"}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">{s.age ?? "-"}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">{s.sex || "-"}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">{s.treatment || "-"}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">{s.response || "-"}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">{s.time_from_treatment_start}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-700 px-3 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setFilterPage(Math.max(1, filterPage - 1))}
            disabled={filterPage === 1}
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
              value={filterPage}
              onChange={(e) => {
                let v = Number.parseInt(e.target.value, 10) || 1
                v = Math.min(Math.max(1, v), totalPages)
                setFilterPage(v)
              }}
              className="w-16 text-center bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white"
            />
            of {totalPages}
          </div>

          <button
            onClick={() => setFilterPage(Math.min(totalPages, filterPage + 1))}
            disabled={filterPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
