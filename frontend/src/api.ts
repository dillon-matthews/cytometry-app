import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export interface Sample {
  sample_id: string;
  project: string;
  subject: string;
  condition?: string;
  age?: number;
  sex?: string;
  treatment?: string;
  response?: string;
  sample_type: string;
  time_from_treatment_start: number;
  cell_counts: Record<string, number>;
}

export interface Frequency {
  sample: string;
  total_count: number;
  population: string;
  count: number;
  percentage: number;
}

export interface ResponseAnalysis {
  population: string;
  responders: number[];
  non_responders: number[];
  p_value: number;
}

export interface BaselineSummary {
  samples_by_project: Record<string, number>;
  subjects_by_response: Record<string, number>;
  subjects_by_sex: Record<string, number>;
}

export interface FilterParams {
  condition?: string;
  treatment?: string;
  sample_type?: string;
  time_from_treatment_start?: number;
}

export interface FilterSummary {
  samples_by_project: Record<string, number>;
  subjects_by_response: Record<string, number>;
  subjects_by_sex: Record<string, number>;
}

export const api = {
  uploadCSV: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return axios.post(`${API_BASE}/upload`, fd);
  },

  getSamples: async (): Promise<Sample[]> => {
    const { data } = await axios.get(`${API_BASE}/samples`);
    return data;
  },

  addSample: async (s: Sample) => {
    return axios.post(`${API_BASE}/samples`, s);
  },

  deleteSample: async (id: string) => {
    return axios.delete(`${API_BASE}/samples/${id}`);
  },

  getFrequencies: async (): Promise<Frequency[]> => {
    const { data } = await axios.get(`${API_BASE}/frequencies`);
    return data;
  },

  getResponseAnalysis: async (
    params: FilterParams
  ): Promise<ResponseAnalysis[]> => {
    const { data } = await axios.post(`${API_BASE}/response-analysis`, params);
    return data;
  },

  getBaselineSummary: async (): Promise<BaselineSummary> => {
    const { data } = await axios.get(`${API_BASE}/baseline-summary`);
    return data;
  },

  getFilterSummary: async (params: FilterParams): Promise<FilterSummary> => {
    const { data } = await axios.post(`${API_BASE}/filter-summary`, params);
    return data;
  },

  getFilterSamples: async (params: FilterParams): Promise<Sample[]> => {
    const { data } = await axios.post(`${API_BASE}/filter-samples`, params);
    return data;
  },
};
