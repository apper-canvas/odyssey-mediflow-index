import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { exportService } from "@/services/api/exportService";
import { toast } from "react-toastify";

const ExportModal = ({ isOpen, onClose, dataType = "patients" }) => {
  const [exportConfig, setExportConfig] = useState({
    format: "csv",
    dataTypes: ["patients"],
    dateRange: "all",
    startDate: "",
    endDate: "",
    patientIds: [],
    includeHeaders: true,
    includeDeleted: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const formatOptions = [
    { value: "csv", label: "CSV (Comma Separated Values)", icon: "FileText" },
    { value: "pdf", label: "PDF Document", icon: "FileType" }
  ];

  const dataTypeOptions = {
    patients: [
      { value: "patients", label: "Patient Information", icon: "Users" },
      { value: "appointments", label: "Appointment History", icon: "Calendar" },
      { value: "clinicalNotes", label: "Clinical Notes", icon: "FileText" }
    ],
    reports: [
      { value: "summary", label: "Practice Summary", icon: "BarChart3" },
      { value: "analytics", label: "Analytics Data", icon: "TrendingUp" },
      { value: "appointments", label: "Appointment Statistics", icon: "Calendar" },
      { value: "patients", label: "Patient Demographics", icon: "Users" }
    ]
  };

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
    { value: "quarter", label: "Last Quarter" },
    { value: "year", label: "Last Year" },
    { value: "custom", label: "Custom Date Range" }
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await exportService.exportData({
        ...exportConfig,
        sourceType: dataType
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      // Trigger file download
      const blob = new Blob([result.data], { 
        type: exportConfig.format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Export completed! Downloaded ${result.filename}`);
      
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        onClose();
      }, 1000);

    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleConfigChange = (key, value) => {
    setExportConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDataTypeToggle = (type) => {
    setExportConfig(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(type)
        ? prev.dataTypes.filter(t => t !== type)
        : [...prev.dataTypes, type]
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Download" size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Export Data</h3>
                  <p className="text-sm text-slate-600">Choose format and configure export options</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isExporting}
              >
                <ApperIcon name="X" size={18} />
              </Button>
            </div>

            {/* Export Progress */}
            {isExporting && (
              <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="animate-spin">
                    <ApperIcon name="Loader2" size={16} className="text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-primary-900">
                    Exporting data... {exportProgress}%
                  </span>
                </div>
                <div className="w-full bg-primary-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Export Format</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formatOptions.map(format => (
                    <div
                      key={format.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        exportConfig.format === format.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => handleConfigChange('format', format.value)}
                    >
                      <div className="flex items-center space-x-3">
                        <ApperIcon 
                          name={format.icon} 
                          size={18} 
                          className={exportConfig.format === format.value ? 'text-primary-600' : 'text-slate-400'} 
                        />
                        <div>
                          <div className="font-medium text-slate-900">{format.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Types Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Data to Export</label>
                <div className="space-y-2">
                  {dataTypeOptions[dataType]?.map(option => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => handleDataTypeToggle(option.value)}
                    >
                      <input
                        type="checkbox"
                        checked={exportConfig.dataTypes.includes(option.value)}
                        onChange={() => {}}
                        className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                      />
                      <ApperIcon name={option.icon} size={16} className="text-slate-400" />
                      <span className="text-slate-900">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Date Range</label>
                <Select
                  value={exportConfig.dateRange}
                  onChange={(e) => handleConfigChange('dateRange', e.target.value)}
                  className="mb-4"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                {exportConfig.dateRange === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="Start Date"
                      value={exportConfig.startDate}
                      onChange={(e) => handleConfigChange('startDate', e.target.value)}
                    />
                    <Input
                      type="date"
                      label="End Date"
                      value={exportConfig.endDate}
                      onChange={(e) => handleConfigChange('endDate', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Export Options */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Export Options</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeHeaders"
                      checked={exportConfig.includeHeaders}
                      onChange={(e) => handleConfigChange('includeHeaders', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="includeHeaders" className="text-slate-900">
                      Include column headers
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeDeleted"
                      checked={exportConfig.includeDeleted}
                      onChange={(e) => handleConfigChange('includeDeleted', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="includeDeleted" className="text-slate-900">
                      Include archived/deleted records
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-6 mt-6 border-t border-slate-200 space-y-4 md:space-y-0">
              <div className="text-sm text-slate-600">
                {exportConfig.dataTypes.length > 0 
                  ? `${exportConfig.dataTypes.length} data type${exportConfig.dataTypes.length > 1 ? 's' : ''} selected`
                  : 'No data types selected'
                }
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleExport}
                  disabled={isExporting || exportConfig.dataTypes.length === 0}
                >
                  {isExporting ? (
                    <>
                      <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Download" size={16} className="mr-2" />
                      Export {exportConfig.format.toUpperCase()}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExportModal;