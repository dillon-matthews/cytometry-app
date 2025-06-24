"use client"

import React from "react"
import Plot from "react-plotly.js"
import type { FilterParams } from "../api"

interface ResponseAnalysisProps {
  analysis: any[]
  analysisParams: FilterParams
  setAnalysisParams: (params: FilterParams) => void
}

export const ResponseAnalysis: React.FC<ResponseAnalysisProps> = ({ analysis, analysisParams, setAnalysisParams }) => {
  const plotData = React.useMemo(() => {
    const xR = analysis.flatMap((d) => Array(d.responders.length).fill(d.population))
    const yR = analysis.flatMap((d) => d.responders)
    const xN = analysis.flatMap((d) => Array(d.non_responders.length).fill(d.population))
    const yN = analysis.flatMap((d) => d.non_responders)
    return [
      {
        x: xR,
        y: yR,
        name: "Responders",
        type: "box" as const,
        marker: { color: "rgba(59, 130, 246, 0.8)" },
        line: { color: "rgb(59, 130, 246)" },
      },
      {
        x: xN,
        y: yN,
        name: "Non-responders",
        type: "box" as const,
        marker: { color: "rgba(239, 68, 68, 0.8)" },
        line: { color: "rgb(239, 68, 68)" },
      },
    ]
  }, [analysis])

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Filter Controls */}
      <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Analysis Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Condition</label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={analysisParams.condition}
              onChange={(e) =>
                setAnalysisParams({
                  ...analysisParams,
                  condition: e.target.value,
                })
              }
            >
              <option value="melanoma">melanoma</option>
              <option value="carcinoma">carcinoma</option>
              <option value="healthy">healthy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Treatment</label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={analysisParams.treatment}
              onChange={(e) =>
                setAnalysisParams({
                  ...analysisParams,
                  treatment: e.target.value,
                })
              }
            >
              <option value="miraclib">miraclib</option>
              <option value="phauximab">phauximab</option>
              <option value="">none</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sample Type</label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={analysisParams.sample_type}
              onChange={(e) =>
                setAnalysisParams({
                  ...analysisParams,
                  sample_type: e.target.value,
                })
              }
            >
              <option value="PBMC">PBMC</option>
              <option value="WB">WB</option>
            </select>
          </div>
        </div>
      </div>

      {/* P-value Results */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-slate-700 border-b border-slate-600">
          <h3 className="text-lg font-semibold text-white">Statistical Significance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Population
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  P-Value
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Significance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {analysis.map((d) => (
                <tr key={d.population} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 text-sm font-medium text-white">{d.population}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">{d.p_value.toFixed(4)}</td>
                  <td className="px-3 sm:px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        d.p_value < 0.05 ? "bg-orange-500/20 text-orange-400" : "bg-slate-600 text-slate-300"
                      }`}
                    >
                      {d.p_value < 0.05 ? "Significant" : "Not Significant"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Boxplot Visualization */}
      <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Population Frequency Comparison</h3>
        <div className="bg-white rounded-lg p-2 sm:p-4">
          <Plot
            data={plotData}
            layout={{
              title: {
                text: "Cell Population Frequencies by Response",
                font: { color: "#1e293b", size: 16 },
              },
              boxmode: "group",
              xaxis: {
                title: { text: "Population", font: { color: "#1e293b" } },
                tickfont: { color: "#1e293b" },
              },
              yaxis: {
                title: { text: "% of Total", font: { color: "#1e293b" } },
                tickfont: { color: "#1e293b" },
              },
              autosize: true,
              paper_bgcolor: "white",
              plot_bgcolor: "white",
              legend: {
                font: { color: "#1e293b" },
              },
              margin: { l: 50, r: 50, t: 50, b: 50 },
            }}
            style={{ width: "100%", height: "500px" }}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler={true}
          />
        </div>
      </div>
    </div>
  )
}
