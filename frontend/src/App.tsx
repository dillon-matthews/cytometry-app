"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  api,
  type Sample,
  type Frequency,
  type ResponseAnalysis as ResponseAnalysisType,
  type FilterParams,
  type FilterSummary,
} from "./api";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { SampleOverview } from "./components/SampleOverview";
import { PopulationFrequencies } from "./components/PopulationFrequencies";
import { ResponseAnalysis } from "./components/ResponseAnalysis";
import { FilterSummarize } from "./components/FilterSummarize";
import { AddSampleModal } from "./components/AddSampleModal";

const App: React.FC = () => {
  type View = "samples" | "freqs" | "analysis" | "baseline" | "filter";
  const [view, setView] = useState<View>("samples");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 500;
  const [filterPage, setFilterPage] = useState(1);

  const [samples, setSamples] = useState<Sample[]>([]);
  const [freqs, setFreqs] = useState<Frequency[]>([]);
  const [analysis, setAnalysis] = useState<ResponseAnalysisType[]>([]);

  const [filterParams, setFilterParams] = useState<FilterParams>({
    condition: undefined,
    treatment: undefined,
    sample_type: undefined,
    time_from_treatment_start: undefined,
  });
  const [filterSummary, setFilterSummary] = useState<FilterSummary | null>(
    null
  );
  const [filterSamples, setFilterSamples] = useState<Sample[]>([]);

  const [analysisParams, setAnalysisParams] = useState<FilterParams>({
    condition: "melanoma",
    treatment: "miraclib",
    sample_type: "PBMC",
    time_from_treatment_start: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [newSample, setNewSample] = useState<Sample>({
    sample_id: "",
    project: "",
    subject: "",
    condition: "",
    age: 0,
    sex: "",
    treatment: "",
    response: "",
    sample_type: "PBMC",
    time_from_treatment_start: 0,
    cell_counts: {
      b_cell: 0,
      cd8_t_cell: 0,
      cd4_t_cell: 0,
      nk_cell: 0,
      monocyte: 0,
    },
  });

  useEffect(() => {
    loadSamples();
  }, []);

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    const result = await api.getResponseAnalysis(analysisParams);
    setAnalysis(result);
    setLoading(false);
  }, [analysisParams]);

  useEffect(() => {
    if (view === "analysis") {
      loadAnalysis();
    }
  }, [view, loadAnalysis]);

  async function loadSamples() {
    setSamples(await api.getSamples());
  }

  async function loadFrequencies() {
    setFreqs(await api.getFrequencies());
  }

  async function applyFilters() {
    setLoading(true);
    setFilterSummary(await api.getFilterSummary(filterParams));
    setFilterSamples(await api.getFilterSamples(filterParams));
    setLoading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    await api.uploadCSV(file);
    await loadSamples();
    if (view === "freqs") await loadFrequencies();
    if (view === "analysis") await loadAnalysis();
    if (view === "filter") await applyFilters();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await api.deleteSample(id);
    await loadSamples();
    if (view === "freqs") await loadFrequencies();
    if (view === "analysis") await loadAnalysis();
    if (view === "filter") await applyFilters();
  }

  async function handleAdd() {
    if (!newSample.sample_id.trim()) {
      alert("⚠️ Please enter a Sample ID.");
      return;
    }
    if (!newSample.project.trim()) {
      alert("⚠️ Please select a Project.");
      return;
    }
    if (!newSample.subject.trim()) {
      alert("⚠️ Please enter a Subject.");
      return;
    }

    try {
      await api.addSample(newSample);
    } catch (err: any) {
      console.error("Add sample failed:", err);
      alert(
        "Failed to add sample: " + err.response?.data?.detail || err.message
      );
      return;
    }

    setAddDialogOpen(false);
    await loadSamples();
    if (view === "freqs") await loadFrequencies();
    if (view === "analysis") await loadAnalysis();
    if (view === "filter") await applyFilters();

    setNewSample({
      sample_id: "",
      project: "",
      subject: "",
      condition: "",
      age: 0,
      sex: "",
      treatment: "",
      response: "",
      sample_type: "PBMC",
      time_from_treatment_start: 0,
      cell_counts: {
        b_cell: 0,
        cd8_t_cell: 0,
        cd4_t_cell: 0,
        nk_cell: 0,
        monocyte: 0,
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar
        view={view}
        setView={setView}
        loading={loading}
        handleFileUpload={handleFileUpload}
        setAddDialogOpen={setAddDialogOpen}
        loadFrequencies={loadFrequencies}
        loadAnalysis={loadAnalysis}
        applyFilters={applyFilters}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar view={view} loading={loading} />

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {view === "samples" && (
            <SampleOverview
              samples={samples}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              handleDelete={handleDelete}
            />
          )}

          {view === "freqs" && (
            <PopulationFrequencies
              freqs={freqs}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
            />
          )}

          {view === "analysis" && (
            <ResponseAnalysis
              analysis={analysis}
              analysisParams={analysisParams}
              setAnalysisParams={setAnalysisParams}
            />
          )}

          {view === "filter" && (
            <FilterSummarize
              filterParams={filterParams}
              setFilterParams={setFilterParams}
              filterSummary={filterSummary}
              filterSamples={filterSamples}
              filterPage={filterPage}
              setFilterPage={setFilterPage}
              pageSize={pageSize}
              applyFilters={applyFilters}
            />
          )}
        </div>
      </div>

      {/* Add Sample Modal */}
      <AddSampleModal
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        newSample={newSample}
        setNewSample={setNewSample}
        onAdd={handleAdd}
      />
    </div>
  );
};

export default App;
