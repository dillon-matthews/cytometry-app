"use client";

import React from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import type { Sample } from "../api";

interface AddSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  newSample: Sample;
  setNewSample: (sample: Sample) => void;
  onAdd: () => void;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
}) => {
  if (!isOpen) return null;

  const icons = {
    error: <AlertCircle className="w-6 h-6 text-red-400" />,
    success: <CheckCircle className="w-6 h-6 text-green-400" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
    info: <Info className="w-6 h-6 text-blue-400" />,
  };

  const borderColors = {
    error: "border-red-500",
    success: "border-green-500",
    warning: "border-yellow-500",
    info: "border-blue-500",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div
        className={`bg-slate-800 rounded-xl border-2 ${borderColors[type]} p-6 w-full max-w-md`}
      >
        <div className="flex items-start gap-4">
          {icons[type]}
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
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export const AddSampleModal: React.FC<AddSampleModalProps> = ({
  isOpen,
  onClose,
  newSample,
  setNewSample,
  onAdd,
}) => {
  const [notification, setNotification] = React.useState<{
    isOpen: boolean;
    type: "error" | "success" | "warning" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const showNotification = (
    type: "error" | "success" | "warning" | "info",
    title: string,
    message: string
  ) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const handleAdd = () => {
    const missingFields = [];

    if (!newSample.sample_id.trim()) {
      missingFields.push("Sample ID");
    }
    if (!newSample.project) {
      missingFields.push("Project");
    }
    if (!newSample.subject.trim()) {
      missingFields.push("Subject");
    }
    if (!newSample.sex) {
      missingFields.push("Sex");
    }

    if (missingFields.length > 0) {
      const title = "Missing Required Fields";
      const message = `Please fill in the following required fields: ${missingFields.join(
        ", "
      )}`;
      showNotification("error", title, message);
      return;
    }

    onAdd();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Add New Sample</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Sample ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newSample.sample_id}
                onChange={(e) =>
                  setNewSample({ ...newSample, sample_id: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newSample.project}
                onChange={(e) =>
                  setNewSample({ ...newSample, project: e.target.value })
                }
              >
                <option value="">Select…</option>
                <option value="prj1">prj1</option>
                <option value="prj2">prj2</option>
                <option value="prj3">prj3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newSample.subject}
                onChange={(e) =>
                  setNewSample({ ...newSample, subject: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Age
              </label>
              <input
                type="number"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newSample.age || ""}
                onChange={(e) =>
                  setNewSample({
                    ...newSample,
                    age:
                      e.target.value === ""
                        ? 0
                        : Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Condition
              </label>
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newSample.condition || ""}
                onChange={(e) =>
                  setNewSample({
                    ...newSample,
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Sex <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newSample.sex || ""}
                onChange={(e) =>
                  setNewSample({ ...newSample, sex: e.target.value })
                }
              >
                <option value="">Select…</option>
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Treatment
              </label>
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newSample.treatment || ""}
                onChange={(e) =>
                  setNewSample({
                    ...newSample,
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Response
              </label>
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newSample.response || ""}
                onChange={(e) =>
                  setNewSample({
                    ...newSample,
                    response: e.target.value || undefined,
                  })
                }
              >
                <option value="">Any</option>
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Sample Type
              </label>
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newSample.sample_type}
                onChange={(e) =>
                  setNewSample({
                    ...newSample,
                    sample_type: e.target.value,
                  })
                }
              >
                <option value="PBMC">PBMC</option>
                <option value="WB">WB</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Time From Start
              </label>
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={newSample.time_from_treatment_start.toString()}
                onChange={(e) =>
                  setNewSample({
                    ...newSample,
                    time_from_treatment_start: Number.parseInt(
                      e.target.value,
                      10
                    ),
                  })
                }
              >
                <option value="0">0</option>
                <option value="7">7</option>
                <option value="14">14</option>
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">
                Cell Counts
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(newSample.cell_counts).map(([cell, val]) => (
                  <div key={cell}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {cell.replace("_", " ").toUpperCase()}
                    </label>
                    <input
                      type="number"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={val || ""}
                      onChange={(e) =>
                        setNewSample({
                          ...newSample,
                          cell_counts: {
                            ...newSample.cell_counts,
                            [cell]:
                              e.target.value === ""
                                ? 0
                                : Number.parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Add Sample
            </button>
          </div>
        </div>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  );
};
