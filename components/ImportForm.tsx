'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface ProgressData {
  type: string;
  message?: string;
  progress?: number;
  inserted?: number;
  processed?: number;
  total?: number;
  currentBatch?: number;
  totalBatches?: number;
  errors?: number;
  totalRecords?: number;
  parsedRecords?: number;
  parseErrors?: number;
  [key: string]: any;
}

export default function ImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<ProgressData | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
      setProgress(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    // Set initial progress to show loading immediately
    setProgress({ type: 'start', message: 'Starting import...', progress: 0 });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/stream', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          setError(errorData.error || 'Import failed');
        } catch {
          setError('Import failed: ' + response.statusText);
        }
        setLoading(false);
        setProgress(null);
        return;
      }

      // Handle Server-Sent Events stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: ProgressData = JSON.parse(line.slice(6));
              
              if (data.type === 'error') {
                setError(data.error || 'Import failed');
                setLoading(false);
                return;
              } else if (data.type === 'complete') {
                setResult(data);
                setProgress(null);
                setLoading(false);
                return;
              } else if (data.type === 'progress' || data.type === 'start') {
                console.log('Progress update:', data);
                setProgress(data);
              }
            } catch (err) {
              console.error('Error parsing SSE data:', err);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>Import Demographic Data</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="file" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Select Text File
          </label>
          <input
            id="file"
            type="file"
            accept=".txt,.csv"
            onChange={handleFileChange}
            disabled={loading}
            style={{ 
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%'
            }}
          />
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
            Expected format: FIRST_NAME:LAST_NAME:ADDRESS:CITY:STATE:ZIP_CODE:SSN:DATE_OF_BIRTH
          </p>
        </div>

        <button
          type="submit"
          className="button button-primary"
          disabled={!file || loading}
        >
          {loading ? 'Importing...' : 'Import File'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {(loading || progress) && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <strong style={{ fontSize: '16px' }}>
                {progress?.message || 'Processing...'}
              </strong>
              {progress && progress.progress !== undefined && (
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {progress.progress}%
                </span>
              )}
            </div>
            {progress && progress.progress !== undefined && (
              <div style={{
                width: '100%',
                height: '24px',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress.progress}%`,
                  height: '100%',
                  backgroundColor: '#0070f3',
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {progress.progress >= 15 && `${progress.progress}%`}
                </div>
              </div>
            )}
          </div>

          {progress && progress.inserted !== undefined && progress.total !== undefined && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginTop: '16px',
              padding: '12px',
              background: 'white',
              borderRadius: '4px'
            }}>
              <div>
                <strong style={{ color: '#666', fontSize: '12px' }}>Inserted Records:</strong>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                  {progress.inserted.toLocaleString()}
                </div>
                {progress.total && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                  of {progress.total.toLocaleString()}
                  </div>
                )}
              </div>
              {progress.processed !== undefined && (
                <div>
                  <strong style={{ color: '#666', fontSize: '12px' }}>Processed:</strong>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {progress.processed.toLocaleString()}
                  </div>
                </div>
              )}
              {progress.currentBatch !== undefined && progress.totalBatches !== undefined && (
                <div>
                  <strong style={{ color: '#666', fontSize: '12px' }}>Batch:</strong>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {progress.currentBatch} / {progress.totalBatches}
                  </div>
                </div>
              )}
              {progress.errors !== undefined && progress.errors > 0 && (
                <div>
                  <strong style={{ color: '#666', fontSize: '12px' }}>Errors:</strong>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                    {progress.errors}
                  </div>
                </div>
              )}
            </div>
          )}

          {progress && progress.parsedRecords !== undefined && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: 'white',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <strong>Parsed Records:</strong> {progress.parsedRecords.toLocaleString()}
              {progress.parseErrors !== undefined && progress.parseErrors > 0 && (
                <span style={{ color: '#dc3545', marginLeft: '12px' }}>
                  Parse Errors: {progress.parseErrors}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '16px' }}>Import Results</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <strong>Total Lines:</strong> {result.totalLines.toLocaleString()}
            </div>
            <div>
              <strong>Parsed Records:</strong> {result.parsedRecords.toLocaleString()}
            </div>
            <div>
              <strong>Inserted Records:</strong> <span style={{ color: '#28a745' }}>{result.insertedRecords.toLocaleString()}</span>
            </div>
            <div>
              <strong>Parse Errors:</strong> <span style={{ color: result.parseErrors > 0 ? '#dc3545' : '#666' }}>{result.parseErrors}</span>
            </div>
            <div>
              <strong>Insert Errors:</strong> <span style={{ color: result.insertErrors > 0 ? '#dc3545' : '#666' }}>{result.insertErrors}</span>
            </div>
          </div>

          {result.errors && (result.errors.parse.length > 0 || result.errors.insert.length > 0) && (
            <details style={{ marginTop: '16px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '500', marginBottom: '8px' }}>
                View Errors ({result.errors.parse.length + result.errors.insert.length})
              </summary>
              <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'white', padding: '12px', borderRadius: '4px', fontSize: '12px' }}>
                {result.errors.parse.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Parse Errors:</strong>
                    <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                      {result.errors.parse.slice(0, 10).map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                      {result.errors.parse.length > 10 && (
                        <li>... and {result.errors.parse.length - 10} more</li>
                      )}
                    </ul>
                  </div>
                )}
                {result.errors.insert.length > 0 && (
                  <div>
                    <strong>Insert Errors:</strong>
                    <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                      {result.errors.insert.slice(0, 10).map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                      {result.errors.insert.length > 10 && (
                        <li>... and {result.errors.insert.length - 10} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

