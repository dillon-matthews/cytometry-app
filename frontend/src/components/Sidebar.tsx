"use client";

import type React from "react";
import {
  Upload,
  Database,
  BarChart3,
  Filter,
  Plus,
  FlaskConical,
  Users,
  Activity,
} from "lucide-react";

type View = "samples" | "freqs" | "analysis" | "baseline" | "filter";

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  loading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setAddDialogOpen: (open: boolean) => void;
  loadFrequencies: () => void;
  loadAnalysis: () => void;
  applyFilters: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  view,
  setView,
  loading,
  handleFileUpload,
  setAddDialogOpen,
  loadFrequencies,
  loadAnalysis,
  applyFilters,
}) => {
  const sidebarItems = [
    {
      id: "samples",
      label: "Sample Overview",
      icon: Database,
      view: "samples" as View,
    },
    {
      id: "freqs",
      label: "Population Frequencies",
      icon: BarChart3,
      view: "freqs" as View,
    },
    {
      id: "analysis",
      label: "Response Analysis",
      icon: Activity,
      view: "analysis" as View,
    },
    {
      id: "filter",
      label: "Filter & Summarize",
      icon: Filter,
      view: "filter" as View,
    },
  ];

  return (
    <div className="w-80 lg:w-80 md:w-64 sm:w-60 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">Cytometry</h1>
        </div>

        {/* Upload Section */}
        <div className="space-y-3">
          <label
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
              loading
                ? "opacity-50 cursor-not-allowed bg-slate-700"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Upload CSV Data</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </label>

          <button
            onClick={() => setAddDialogOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Sample</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-6">
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Analysis Tools
          </h2>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.view);
                  if (item.view === "freqs") loadFrequencies();
                  if (item.view === "analysis") loadAnalysis();
                  if (item.view === "filter") applyFilters();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  view === item.view
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-700">
        <div className="flex items-center gap-3 text-slate-400">
          <Users className="w-4 h-4" />
          <span className="text-sm">Bob Loblaw - Loblaw Bio</span>
        </div>
      </div>
    </div>
  );
};
