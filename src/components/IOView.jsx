import { useState, useRef } from 'react'

export default function IOView({ folders, onExport, onImport }) {
  const [exportScope, setExportScope] = useState('__all__')
  const [importMode, setImportMode] = useState('csv')
  const [importOverrideId, setImportOverrideId] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name))

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => onImport(e.target.result, importMode, importOverrideId || null)
    reader.readAsText(file)
  }

  return (
    <div id="io-view">
      <div className="io-title">Import &amp; Export</div>

      {/* Export */}
      <div className="io-section">
        <h3>⬇️&nbsp; Export Credentials</h3>
        <p>
          Download credentials as a CSV file.{' '}
          <strong>Warning:</strong> this file is <strong>not encrypted</strong> — store it securely and delete it after use.
        </p>
        <div className="io-folder-row">
          <label className="form-lbl" style={{ margin: 0, whiteSpace: 'nowrap' }}>Export scope</label>
          <select className="form-inp" value={exportScope} onChange={(e) => setExportScope(e.target.value)}>
            <option value="__all__">All Folders</option>
            <option value="__none__">No Folder (unfiled only)</option>
            {sortedFolders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={() => onExport(exportScope, (id) => folders.find((f) => f.id === id))}>
          Export as CSV
        </button>
      </div>

      {/* Import */}
      <div className="io-section">
        <h3>⬆️&nbsp; Import Credentials</h3>
        <p>
          Import from a CSV file. First row must be headers:{' '}
          <code>site</code>, <code>user</code>, <code>pass</code>, <code>url</code>,{' '}
          <code>category</code>, <code>notes</code>, <code>folder</code>.{' '}
          Duplicate credentials are skipped automatically.
        </p>
        <label className="form-lbl">Folder assignment</label>
        <div className="io-radio-group">
          <label className="io-radio">
            <input type="radio" name="import-folder-mode" value="csv"
              checked={importMode === 'csv'} onChange={() => setImportMode('csv')} />
            Use <code>folder</code> column from the CSV
          </label>
          <label className="io-radio">
            <input type="radio" name="import-folder-mode" value="override"
              checked={importMode === 'override'} onChange={() => setImportMode('override')} />
            Override — assign all imports to:
          </label>
          {importMode === 'override' && (
            <div id="import-override-wrap">
              <select className="form-inp" value={importOverrideId} onChange={(e) => setImportOverrideId(e.target.value)}>
                <option value="">— No Folder —</option>
                {sortedFolders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div
          className={`file-drop${dragOver ? ' drag-over' : ''}`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
        >
          <div className="file-drop-ico">📂</div>
          <p>Click to choose a CSV file, or drag &amp; drop here</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: 'none' }}
          onChange={(e) => { handleFile(e.target.files[0]); e.target.value = '' }}
        />
      </div>
    </div>
  )
}
