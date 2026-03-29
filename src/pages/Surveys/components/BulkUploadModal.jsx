// pages/Surveys/components/BulkUploadModal.jsx
// ============================================================================
// Multi-step Bulk Upload Modal
//   Step 1: Upload file (drag & drop + download template)
//   Step 2: Validation preview (valid/invalid rows, error table)
//   Step 3: Results (success/failure counts)
// ============================================================================

import { useState, useRef, useCallback } from "react";
import {
  MdClose,
  MdUploadFile,
  MdFileDownload,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdCloudUpload,
  MdRefresh,
  MdSend,
  MdInfoOutline,
  MdErrorOutline,
} from "react-icons/md";
import axiosInstance from "../../../api/axiosInstance";

const STEPS = [
  { label: "Upload", icon: MdCloudUpload },
  { label: "Preview", icon: MdInfoOutline },
  { label: "Results", icon: MdCheckCircle },
];

const BulkUploadModal = ({ isOpen, onClose, surveyId, surveyTitle }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  // Validation results
  const [validationResult, setValidationResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Confirm results
  const [confirmResult, setConfirmResult] = useState(null);

  // Error table pagination
  const [errorPage, setErrorPage] = useState(1);
  const errorsPerPage = 10;

  const fileInputRef = useRef(null);

  // ==========================================
  // Download Template
  // ==========================================
  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const response = await axiosInstance.get(
        `/surveys/${surveyId}/export-template`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `survey_template_${surveyId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Template download error:", err);
      setUploadError(
        err.response?.data?.message || "Failed to download template"
      );
    } finally {
      setDownloadingTemplate(false);
    }
  };

  // ==========================================
  // File Handling
  // ==========================================
  const handleFileSelect = useCallback((selectedFile) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
      "application/octet-stream",
    ];
    const ext = selectedFile.name.split(".").pop().toLowerCase();

    if (!["xlsx", "xls", "csv"].includes(ext)) {
      setUploadError("Invalid file type. Please upload a CSV or Excel (.xlsx) file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 10MB.");
      return;
    }

    setFile(selectedFile);
    setUploadError(null);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // ==========================================
  // Upload & Validate
  // ==========================================
  const handleUploadAndValidate = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post(
        `/surveys/${surveyId}/bulk-upload/validate`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setValidationResult(response.data);
      setStep(2);
    } catch (err) {
      console.error("Upload validation error:", err);
      setUploadError(
        err.response?.data?.message || "Failed to validate file. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // Confirm & Insert (uses jobId — server-side cache)
  // ==========================================
  const handleConfirmInsert = async () => {
    if (!validationResult?.jobId || !validationResult?.validCount) return;

    try {
      setConfirming(true);

      const response = await axiosInstance.post(
        `/surveys/${surveyId}/bulk-upload/confirm`,
        { jobId: validationResult.jobId }
      );

      setConfirmResult(response.data);
      setStep(3);
    } catch (err) {
      console.error("Confirm insert error:", err);
      const errMsg = err.response?.data?.message || "Failed to insert responses. Please try again.";
      // If session expired, guide user to re-upload
      if (err.response?.status === 410) {
        setUploadError(errMsg + " Please re-upload the file.");
        setStep(1);
      } else {
        setUploadError(errMsg);
      }
    } finally {
      setConfirming(false);
    }
  };

  // ==========================================
  // Download Error Report
  // ==========================================
  const handleDownloadErrorReport = () => {
    if (!validationResult?.invalidRows?.length) return;

    const csvRows = ["Row,Field,Question,Expected,Actual,Error"];
    validationResult.invalidRows.forEach((row) => {
      row.errors.forEach((err) => {
        csvRows.push(
          `${row.row},"${err.field}","${err.question || ""}","${err.expected}","${err.actual}","${err.error}"`
        );
      });
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bulk_upload_errors_${surveyId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // ==========================================
  // Reset
  // ==========================================
  const handleReset = () => {
    setStep(1);
    setFile(null);
    setValidationResult(null);
    setConfirmResult(null);
    setUploadError(null);
    setErrorPage(1);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  // Paginated errors
  const paginatedErrors = validationResult?.invalidRows?.slice(
    (errorPage - 1) * errorsPerPage,
    errorPage * errorsPerPage
  ) || [];
  const totalErrorPages = Math.ceil(
    (validationResult?.invalidRows?.length || 0) / errorsPerPage
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-[var(--light-card)] dark:bg-[var(--dark-card)] rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-[var(--light-border)] dark:border-[var(--dark-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <div>
              <h2 className="text-lg font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-2">
                <MdUploadFile className="text-[var(--primary-color)]" size={22} />
                Bulk Upload Responses
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1 truncate max-w-md">
                {surveyTitle}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-md hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] transition-colors text-[var(--light-text)] dark:text-[var(--dark-text)]"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-3 border-b border-[var(--light-border)] dark:border-[var(--dark-border)] bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
            <div className="flex items-center justify-center gap-2">
              {STEPS.map((s, i) => {
                const StepIcon = s.icon;
                const isActive = step === i + 1;
                const isCompleted = step > i + 1;
                return (
                  <div key={s.label} className="flex items-center gap-2">
                    {i > 0 && (
                      <div
                        className={`w-8 h-0.5 transition-colors ${
                          isCompleted || isActive
                            ? "bg-[var(--primary-color)]"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    )}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[var(--primary-color)] text-white"
                          : isCompleted
                          ? "bg-[var(--success-light)] text-[var(--success-color)]"
                          : "bg-gray-100 dark:bg-gray-700 text-[var(--text-secondary)]"
                      }`}
                    >
                      {isCompleted ? (
                        <MdCheckCircle size={14} />
                      ) : (
                        <StepIcon size={14} />
                      )}
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Error Banner */}
            {uploadError && (
              <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
                <MdErrorOutline className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
                  <button
                    onClick={() => setUploadError(null)}
                    className="text-xs text-red-500 hover:underline mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
                STEP 1: Upload
            ========================================== */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Instructions */}
                <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-2">
                    <MdInfoOutline size={16} />
                    How it works
                  </h4>
                  <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 ml-4 list-decimal">
                    <li>Download the survey template (pre-configured with questions & validations)</li>
                    <li>Fill in responses — one row per respondent</li>
                    <li>Delete the sample & hint rows, then upload your file</li>
                    <li>Preview validation results and confirm insertion</li>
                  </ol>
                </div>

                {/* Download Template */}
                <button
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 border-dashed border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-light)] transition-colors font-medium"
                >
                  <MdFileDownload size={20} />
                  {downloadingTemplate ? "Downloading..." : "Download Survey Template (.xlsx)"}
                </button>

                {/* Drag & Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-[var(--primary-color)] bg-[var(--primary-light)]"
                      : file
                      ? "border-[var(--success-color)] bg-[var(--success-light)]"
                      : "border-gray-300 dark:border-gray-600 hover:border-[var(--primary-color)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      if (e.target.files[0]) handleFileSelect(e.target.files[0]);
                    }}
                    className="hidden"
                  />

                  {file ? (
                    <div className="space-y-2">
                      <MdCheckCircle
                        size={40}
                        className="mx-auto text-[var(--success-color)]"
                      />
                      <p className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        {file.name}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {(file.size / 1024).toFixed(1)} KB — Click to change file
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <MdCloudUpload
                        size={40}
                        className="mx-auto text-[var(--text-secondary)]"
                      />
                      <p className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">
                        Drag & drop your file here
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        or click to browse • CSV, XLSX • Max 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==========================================
                STEP 2: Validation Preview
            ========================================== */}
            {step === 2 && validationResult && (
              <div className="space-y-5">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-md bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] border border-[var(--light-border)] dark:border-[var(--dark-border)] text-center">
                    <p className="text-2xl font-bold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                      {validationResult.totalRows}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Total Rows</p>
                  </div>
                  <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {validationResult.validCount}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Valid</p>
                  </div>
                  <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800 text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {validationResult.invalidCount}
                    </p>
                    <p className="text-xs text-red-600 mt-1">Invalid</p>
                  </div>
                </div>

                {/* Warnings */}
                {validationResult.warnings?.length > 0 && (
                  <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/15 border border-yellow-200 dark:border-yellow-800">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 flex items-center gap-1.5 mb-1">
                      <MdWarning size={16} />
                      Warnings
                    </h4>
                    <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1 ml-4 list-disc">
                      {validationResult.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Error Table */}
                {validationResult.invalidCount > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-[var(--light-text)] dark:text-[var(--dark-text)] flex items-center gap-1.5">
                        <MdError className="text-red-500" size={16} />
                        Validation Errors
                      </h4>
                      <button
                        onClick={handleDownloadErrorReport}
                        className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-1"
                      >
                        <MdFileDownload size={14} />
                        Download Error Report
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-md border border-[var(--light-border)] dark:border-[var(--dark-border)]">
                      <table className="min-w-full text-xs">
                        <thead className="bg-[var(--light-bg)] dark:bg-[var(--dark-bg)]">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Row</th>
                            <th className="px-3 py-2 text-left font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Question</th>
                            <th className="px-3 py-2 text-left font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Expected</th>
                            <th className="px-3 py-2 text-left font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Your Value</th>
                            <th className="px-3 py-2 text-left font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedErrors.map((row) =>
                            row.errors.map((err, ei) => (
                              <tr
                                key={`${row.row}-${ei}`}
                                className="border-t border-[var(--light-border)] dark:border-[var(--dark-border)] hover:bg-red-50/50 dark:hover:bg-red-900/10"
                              >
                                {ei === 0 ? (
                                  <td
                                    className="px-3 py-2 font-medium text-[var(--light-text)] dark:text-[var(--dark-text)]"
                                    rowSpan={row.errors.length}
                                  >
                                    {row.row}
                                  </td>
                                ) : null}
                                <td className="px-3 py-2 text-[var(--text-secondary)]">
                                  <span className="font-mono text-[10px] block">{err.field}</span>
                                  {err.question && (
                                    <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">{err.question}</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-green-600">
                                  {err.expected}
                                </td>
                                <td className="px-3 py-2 text-red-500 font-medium">
                                  {err.actual}
                                </td>
                                <td className="px-3 py-2 text-red-600">
                                  {err.error}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Error Pagination */}
                    {totalErrorPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <button
                          onClick={() => setErrorPage((p) => Math.max(1, p - 1))}
                          disabled={errorPage === 1}
                          className="px-3 py-1 text-xs rounded border border-[var(--light-border)] dark:border-[var(--dark-border)] disabled:opacity-40 hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] text-[var(--light-text)] dark:text-[var(--dark-text)]"
                        >
                          Prev
                        </button>
                        <span className="text-xs text-[var(--text-secondary)]">
                          {errorPage} / {totalErrorPages}
                        </span>
                        <button
                          onClick={() => setErrorPage((p) => Math.min(totalErrorPages, p + 1))}
                          disabled={errorPage === totalErrorPages}
                          className="px-3 py-1 text-xs rounded border border-[var(--light-border)] dark:border-[var(--dark-border)] disabled:opacity-40 hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)] text-[var(--light-text)] dark:text-[var(--dark-text)]"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* All valid message */}
                {validationResult.invalidCount === 0 && (
                  <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800 text-center">
                    <MdCheckCircle size={32} className="mx-auto text-green-500 mb-2" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      All {validationResult.validCount} rows are valid!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Ready to insert into the system
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                STEP 3: Results
            ========================================== */}
            {step === 3 && confirmResult && (
              <div className="space-y-5 text-center py-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                  confirmResult.failedCount === 0
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-yellow-100 dark:bg-yellow-900/30"
                }`}>
                  {confirmResult.failedCount === 0 ? (
                    <MdCheckCircle size={40} className="text-green-500" />
                  ) : (
                    <MdWarning size={40} className="text-yellow-500" />
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-[var(--light-text)] dark:text-[var(--dark-text)]">
                    {confirmResult.failedCount === 0
                      ? "Upload Successful!"
                      : "Upload Completed with Issues"}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    {confirmResult.message}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                  <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-600">
                      {confirmResult.insertedCount}
                    </p>
                    <p className="text-xs text-green-600">Inserted</p>
                  </div>
                  {confirmResult.failedCount > 0 && (
                    <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800">
                      <p className="text-2xl font-bold text-red-600">
                        {confirmResult.failedCount}
                      </p>
                      <p className="text-xs text-red-600">Failed</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)] flex items-center justify-between">
            {/* Left actions */}
            <div>
              {step === 2 && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]"
                >
                  <MdRefresh size={16} />
                  Re-upload
                </button>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors border border-[var(--light-border)] dark:border-[var(--dark-border)] text-[var(--light-text)] dark:text-[var(--dark-text)] hover:bg-[var(--light-hover)] dark:hover:bg-[var(--dark-hover)]"
              >
                {step === 3 ? "Close" : "Cancel"}
              </button>

              {/* Step 1: Upload & Validate */}
              {step === 1 && (
                <button
                  onClick={handleUploadAndValidate}
                  disabled={!file || uploading}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Validating...
                    </>
                  ) : (
                    <>
                      <MdCloudUpload size={16} />
                      Upload & Validate
                    </>
                  )}
                </button>
              )}

              {/* Step 2: Proceed with valid rows */}
              {step === 2 && validationResult?.validCount > 0 && validationResult?.jobId && (
                <button
                  onClick={handleConfirmInsert}
                  disabled={confirming}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium transition-colors bg-[var(--primary-color)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confirming ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Inserting...
                    </>
                  ) : (
                    <>
                      <MdSend size={16} />
                      Insert {validationResult.validCount} Valid Row{validationResult.validCount !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              )}

              {/* Step 3: Upload More */}
              {step === 3 && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium transition-colors bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]"
                >
                  <MdRefresh size={16} />
                  Upload More
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BulkUploadModal;
