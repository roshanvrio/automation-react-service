import React, { useState } from "react";
import { uploadCsv } from "../api/api";

export default function UploadCSV() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setMsg("Please upload a CSV file");
      setError(true);
      return;
    }
    
    setLoading(true);
    setError(false);
    setMsg("");
    
    try {
      const response = await uploadCsv(file);
      setMsg(response.message || "Uploaded successfully!");
      setError(false);
      
      // Reset file input
      e.target.value = '';
    } catch (err) {
      console.error("Upload error:", err);
      setMsg(err.message || "Upload failed. Please check your CSV format.");
      setError(true);
    } finally { 
      setLoading(false); 
    }
  };
  
  return (
    <div className="upload-area">
      <label className="upload-label">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
          disabled={loading}
        />
        <div className="upload-btn">
          {loading ? "Uploading..." : "📁 Upload CSV"}
        </div>
      </label>
      
      {msg && (
        <div className={`upload-msg ${error ? 'error' : 'success'}`}>
          {error ? '❌' : '✅'} {msg}
        </div>
      )}
      
      <div style={{ 
        fontSize: '0.75rem', 
        color: '#7a9ea8', 
        marginTop: '0.5rem' 
      }}>
        CSV must contain 'title' and 'status' columns
      </div>
    </div>
  );
}