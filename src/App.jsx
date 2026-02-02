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
    fontSize: '18px',
    lineHeight: '1.5',
    backgroundColor: '#1e1e1e'
  },
  logLine: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    cursor: 'pointer',
    padding: '1px 4px',
    margin: '0 -4px',
    borderRadius: '2px'
  },
  logLineMarked: {
    color: '#666',
    textDecoration: 'line-through',
    backgroundColor: 'rgba(255, 255, 255, 0.03)'
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
  },
  renameButton: {
    marginLeft: '12px',
    padding: '2px 8px',
    fontSize: '12px',
    backgroundColor: '#3c3c3c',
    color: '#d4d4d4',
    border: '1px solid #555',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  renameInput: {
    backgroundColor: '#3c3c3c',
    color: '#d4d4d4',
    border: '1px solid #007acc',
    borderRadius: '3px',
    padding: '2px 6px',
    fontSize: '14px',
    fontWeight: 500,
    outline: 'none'
  },
  saveButton: {
    marginLeft: '12px',
    padding: '2px 8px',
    fontSize: '12px',
    backgroundColor: '#0e639c',
    color: '#fff',
    border: '1px solid #1177bb',
    borderRadius: '3px',
    cursor: 'pointer'
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
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [markedLines, setMarkedLines] = useState(new Set());

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
    setMarkedLines(new Set());

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

  function startRename() {
    setRenameValue(selectedFile.name);
    setRenaming(true);
  }

  function toTitleCase(str) {
    const minor = ['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'as', 'at', 'by', 'in', 'of', 'on', 'to', 'up', 'via'];
    let seenFirstWord = false;
    return str.split(' ').map((word) => {
      const startsWithLetter = /^[a-zA-Z]/.test(word);
      if (!startsWithLetter) {
        return word;
      }
      const lower = word.toLowerCase();
      const isFirstWord = !seenFirstWord;
      seenFirstWord = true;
      if (!isFirstWord && minor.includes(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }

  async function handleRename() {
    if (!renameValue.trim() || renameValue === selectedFile.name) {
      setRenaming(false);
      return;
    }

    let newName = renameValue.trim();
    const oldExt = selectedFile.name.includes('.') ? selectedFile.name.slice(selectedFile.name.lastIndexOf('.')) : '';
    const hasExt = newName.includes('.');

    let baseName, ext;
    if (hasExt) {
      const lastDot = newName.lastIndexOf('.');
      baseName = newName.slice(0, lastDot);
      ext = newName.slice(lastDot);
    } else {
      baseName = newName;
      ext = oldExt;
    }

    newName = toTitleCase(baseName) + ext;

    const result = await window.electronAPI.renameFile(selectedFile.path, newName);
    if (result.success) {
      setSelectedFile({ name: newName, path: result.newPath });
      await loadFiles();
    } else {
      setError(result.error);
    }
    setRenaming(false);
  }

  function handleRenameKeyDown(e) {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setRenaming(false);
    }
  }

  function toggleLineMarked(lineIndex) {
    setMarkedLines(prev => {
      const next = new Set(prev);
      if (next.has(lineIndex)) {
        next.delete(lineIndex);
      } else {
        next.add(lineIndex);
      }
      return next;
    });
  }

  async function saveWithoutMarkedLines() {
    const lines = content.split('\n');
    const deletedLines = lines.filter((_, index) => markedLines.has(index));
    const filteredLines = lines.filter((_, index) => !markedLines.has(index));
    const newContent = filteredLines.join('\n');

    const result = await window.electronAPI.writeFile(selectedFile.path, newContent);
    if (result.success) {
      await window.electronAPI.appendDeletedLines(deletedLines);
      setContent(newContent);
      setMarkedLines(new Set());
    } else {
      setError(result.error);
    }
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
          {selectedFile ? (
            renaming ? (
              <input
                style={styles.renameInput}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={handleRenameKeyDown}
                onBlur={handleRename}
                autoFocus
              />
            ) : (
              <>
                {selectedFile.name}
                <button style={styles.renameButton} onClick={startRename}>Rename</button>
                {markedLines.size > 0 && (
                  <button style={styles.saveButton} onClick={saveWithoutMarkedLines}>
                    Save ({markedLines.size} lines removed)
                  </button>
                )}
              </>
            )
          ) : 'No file selected'}
        </div>
        <div style={styles.logViewer}>
          {!selectedFile && (
            <div style={styles.placeholder}>
              Select a file to view its contents
            </div>
          )}
          {loading && <div style={styles.loading}>Loading...</div>}
          {error && <div style={styles.error}>Error: {error}</div>}
          {content && content.split('\n').map((line, index) => (
            <div
              key={index}
              style={{
                ...styles.logLine,
                ...(markedLines.has(index) ? styles.logLineMarked : {})
              }}
              onClick={() => toggleLineMarked(index)}
            >
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
