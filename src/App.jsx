import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: 0,
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4'
  },
  sidebar: {
    width: '250px',
    borderRight: '1px solid #3c3c3c',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#252526'
  },
  sidebarHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #3c3c3c',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#888'
  },
  fileList: {
    flex: 1,
    overflow: 'auto',
    padding: '8px 0'
  },
  fileItem: {
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  fileItemHover: {
    backgroundColor: '#2a2d2e'
  },
  fileItemSelected: {
    backgroundColor: '#094771'
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  contentHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #3c3c3c',
    fontSize: '14px',
    fontWeight: 500,
    backgroundColor: '#252526'
  },
  logViewer: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    backgroundColor: '#1e1e1e'
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
    fontSize: '14px'
  },
  error: {
    color: '#f48771',
    padding: '16px'
  },
  loading: {
    color: '#888',
    padding: '16px'
  }
};

function App() {
  const [files, setFiles] = useState([]);
  const [directory, setDirectory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredFile, setHoveredFile] = useState(null);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    const result = await window.electronAPI.getLogFiles();
    setDirectory(result.directory);
    setFiles(result.files);
  }

  async function handleFileSelect(file) {
    setSelectedFile(file);
    setLoading(true);
    setError(null);
    setContent('');

    const result = await window.electronAPI.readFile(file.path);
    setLoading(false);

    if (result.success) {
      setContent(result.content);
    } else {
      setError(result.error);
    }
  }

  function getFileItemStyle(file) {
    let style = { ...styles.fileItem };
    if (selectedFile?.path === file.path) {
      style = { ...style, ...styles.fileItemSelected };
    } else if (hoveredFile?.path === file.path) {
      style = { ...style, ...styles.fileItemHover };
    }
    return style;
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader} title={directory}>{directory.split(/[/\\]/).pop() || directory}</div>
        <div style={styles.fileList}>
          {files.length === 0 ? (
            <div style={{ padding: '16px', color: '#666', fontSize: '13px' }}>
              No .txt or .log files found
            </div>
          ) : (
            files.map(file => (
              <div
                key={file.path}
                style={getFileItemStyle(file)}
                onClick={() => handleFileSelect(file)}
                onMouseEnter={() => setHoveredFile(file)}
                onMouseLeave={() => setHoveredFile(null)}
              >
                {file.name}
              </div>
            ))
          )}
        </div>
      </div>
      <div style={styles.content}>
        <div style={styles.contentHeader}>
          {selectedFile ? selectedFile.name : 'No file selected'}
        </div>
        <div style={styles.logViewer}>
          {!selectedFile && (
            <div style={styles.placeholder}>
              Select a file to view its contents
            </div>
          )}
          {loading && <div style={styles.loading}>Loading...</div>}
          {error && <div style={styles.error}>Error: {error}</div>}
          {content && <div>{content}</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
