import type React from "react"

type View = "samples" | "freqs" | "analysis" | "baseline" | "filter"

interface TopBarProps {
  view: View
  loading: boolean
}

export const TopBar: React.FC<TopBarProps> = ({ view, loading }) => {
  const getViewInfo = () => {
    switch (view) {
      case "samples":
        return { title: "Sample Overview", description: "Manage and view all cytometry samples" }
      case "freqs":
        return { title: "Population Frequencies", description: "Analyze cell population frequencies" }
      case "analysis":
        return { title: "Response Analysis", description: "Statistical analysis of treatment responses" }
      case "filter":
        return { title: "Filter & Summarize", description: "Filter samples and generate summaries" }
      default:
        return { title: "Dashboard", description: "Cytometry data management" }
    }
  }

  const { title, description } = getViewInfo()

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">{description}</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-orange-500 mt-2 sm:mt-0">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>
    </div>
  )
}
