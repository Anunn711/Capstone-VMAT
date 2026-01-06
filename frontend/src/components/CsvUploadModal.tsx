import React from 'react';

interface CsvUploadModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (file: File | null) => void;
}

const CsvUploadModal: React.FC<CsvUploadModalProps> = ({ show, onClose, onSubmit }) => {
  const [csvFile, setCsvFile] = React.useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    onSubmit(csvFile);
    setCsvFile(null);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Import CVEs from CSV</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="form-control"
            />
            <div className="mt-3">
              <p>Drag and drop or select a CSV file containing CVEs to import.</p>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!csvFile}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvUploadModal;