"use client";

import React from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, X } from "lucide-react";
import type { Sample } from "../api";

interface SampleOverviewProps {
  samples: Sample[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  handleDelete: (id: string) => void;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      border: "border-red-500",
      icon: "text-red-400",
      button: "bg-red-500 hover:bg-red-600",
    },
    warning: {
      border: "border-yellow-500",
      icon: "text-yellow-400",
      button: "bg-yellow-500 hover:bg-yellow-600",
    },
    info: {
      border: "border-blue-500",
      icon: "text-blue-400",
      button: "bg-blue-500 hover:bg-blue-600",
    },
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div
        className={`bg-slate-800 rounded-xl border-2 ${colors[type].border} p-6 w-full max-w-md`}
      >
        <div className="flex items-start gap-4">
          <AlertTriangle
            className={`w-6 h-6 ${colors[type].icon} flex-shrink-0 mt-0.5`}
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-300 text-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 ${colors[type].button} text-white rounded-lg font-medium transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SampleOverview: React.FC<SampleOverviewProps> = ({
  samples,
  currentPage,
  setCurrentPage,
  pageSize,
  handleDelete,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    isOpen: boolean;
    sampleId: string;
    sampleName: string;
  }>({
    isOpen: false,
    sampleId: "",
    sampleName: "",
  });

  const totalPages = Math.max(1, Math.ceil(samples.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const pageData = samples.slice(start, start + pageSize);

  const handleDeleteClick = (sampleId: string) => {
    const sample = samples.find((s) => s.sample_id === sampleId);
    setDeleteConfirmation({
      isOpen: true,
      sampleId,
      sampleName: sample?.sample_id || sampleId,
    });
  };

  const confirmDelete = () => {
    handleDelete(deleteConfirmation.sampleId);
    setDeleteConfirmation({ isOpen: false, sampleId: "", sampleName: "" });
  };

  return (
    <>
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
                  Treatment
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Response
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  B Cells
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  CD8 T
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  CD4 T
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  NK
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Mono
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {pageData.map((s) => (
                <tr
                  key={s.sample_id}
                  className="hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-3 sm:px-6 py-4 text-sm font-medium text-white">
                    {s.sample_id}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {s.project}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {s.subject}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {s.condition || "-"}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {s.treatment || "-"}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {s.response || "-"}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {s.cell_counts.b_cell}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {s.cell_counts.cd8_t_cell}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {s.cell_counts.cd4_t_cell}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {s.cell_counts.nk_cell}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-slate-300">
                    {s.cell_counts.monocyte}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDeleteClick(s.sample_id)}
                      className="text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ isOpen: false, sampleId: "", sampleName: "" })
        }
        onConfirm={confirmDelete}
        title="Delete Sample"
        message={`Are you sure you want to delete sample "${deleteConfirmation.sampleName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};
