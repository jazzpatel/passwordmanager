import { useState, useEffect, useCallback } from 'react'
import { useVault } from './hooks/useVault.js'
import AuthOverlay from './components/AuthOverlay.jsx'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import BottomTabBar from './components/BottomTabBar.jsx'
import DetailView from './components/DetailView.jsx'
import FormView from './components/FormView.jsx'
import IOView from './components/IOView.jsx'
import SettingsView from './components/SettingsView.jsx'
import FolderView from './components/FolderView.jsx'
import WelcomeState from './components/WelcomeState.jsx'
import Toast from './components/Toast.jsx'

export default function App() {
  const vault = useVault()
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar drawer when a navigation occurs on mobile
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const {
    isUnlocked, credentials, folders, currentId, view, editingId,
    currentFolderId, searchQuery, collapsedFolders, toast, authStatus,
    setView, setEditingId, setCurrentFolderId, setCurrentId, setSearchQuery,
    handleAuth, lockVault, saveCredential, deleteCredential,
    createFolder, renameFolder, deleteFolder, toggleFolderCollapse,
    exportCSV, importCSV, changePassword, saveAutoLockSetting,
    showToast, showDetail, showWelcomeOrFirst,
  } = vault

  const currentCred = credentials.find((c) => c.id === currentId) || null
  const editingCred = editingId ? credentials.find((c) => c.id === editingId) : null
  const currentFolder = folders.find((f) => f.id === currentFolderId) || null
  const credFolder = currentCred?.folderId ? folders.find((f) => f.id === currentCred.folderId) : null

  // ── Handlers ──
  const handleSelectCredential = (id) => {
    setCurrentId(id)
    setEditingId(null)
    setCurrentFolderId(null)
    setView('detail')
    closeSidebar()
  }

  const handleSelectFolder = (id) => {
    setCurrentFolderId(id)
    setCurrentId(null)
    setEditingId(null)
    setView('folder')
    closeSidebar()
  }

  const handleAddCredential = (folderId = null) => {
    setEditingId(null)
    setCurrentFolderId(folderId)
    setView('form')
    closeSidebar()
  }

  const handleEditCredential = () => {
    setEditingId(currentId)
    setView('form')
  }

  const handleCancelForm = () => {
    setEditingId(null)
    if (currentId) {
      setView('detail')
    } else {
      showWelcomeOrFirst(credentials, folders)
    }
  }

  const handleSaveCredential = async (data) => {
    await saveCredential(data)
  }

  const handleDeleteCredential = async (id) => {
    await deleteCredential(id)
  }

  const handleCreateFolder = async (name) => {
    await createFolder(name)
  }

  const handleRenameFolder = async (id, name) => {
    await renameFolder(id, name)
  }

  const handleDeleteFolder = async (id) => {
    await deleteFolder(id)
  }

  const handleFolderBadgeClick = (folderId) => {
    setCurrentFolderId(folderId)
    setCurrentId(null)
    setView('folder')
  }

  return (
    <>
      <Toast msg={toast.msg} visible={toast.visible} />

      {!isUnlocked && (
        <AuthOverlay authStatus={authStatus} onAuth={handleAuth} />
      )}

      {isUnlocked && (
        <>
          <TopBar
            isUnlocked={isUnlocked}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          {/* Backdrop for mobile sidebar */}
          {sidebarOpen && (
            <div
              className="sidebar-backdrop"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div id="app">
            <Sidebar
              credentials={credentials}
              folders={folders}
              currentId={currentId}
              currentFolderId={currentFolderId}
              searchQuery={searchQuery}
              collapsedFolders={collapsedFolders}
              view={view}
              sidebarOpen={sidebarOpen}
              onSearch={setSearchQuery}
              onSelectCredential={handleSelectCredential}
              onSelectFolder={handleSelectFolder}
              onAddCredential={handleAddCredential}
              onShowIO={() => { setView('io'); closeSidebar() }}
              onShowSettings={() => { setView('settings'); closeSidebar() }}
              onLock={() => { lockVault(); closeSidebar() }}
              onToggleFolder={toggleFolderCollapse}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
            />

            <main id="main-pane">
              {view === 'welcome' && <WelcomeState />}

              {view === 'detail' && (
                <DetailView
                  cred={currentCred}
                  folder={credFolder}
                  onEdit={handleEditCredential}
                  onDelete={handleDeleteCredential}
                  onFolderClick={handleFolderBadgeClick}
                />
              )}

              {view === 'form' && (
                <FormView
                  editingCred={editingCred}
                  folders={folders}
                  defaultFolderId={currentFolderId}
                  onSave={handleSaveCredential}
                  onCancel={handleCancelForm}
                  onDelete={handleDeleteCredential}
                />
              )}

              {view === 'io' && (
                <IOView
                  folders={folders}
                  onExport={exportCSV}
                  onImport={importCSV}
                />
              )}

              {view === 'settings' && (
                <SettingsView
                  onSaveAutoLock={saveAutoLockSetting}
                  onChangePassword={changePassword}
                />
              )}

              {view === 'folder' && (
                <FolderView
                  folder={currentFolder}
                  credentials={credentials}
                  onAddCredential={handleAddCredential}
                  onDeleteFolder={handleDeleteFolder}
                  onSelectCredential={handleSelectCredential}
                  onRenameFolder={handleRenameFolder}
                />
              )}
            </main>
          </div>

          <BottomTabBar
            isUnlocked={isUnlocked}
            view={view}
            currentId={currentId}
            searchOpen={searchOpen}
            onHome={() => showWelcomeOrFirst(credentials, folders)}
            onToggleSearch={() => {
              setSearchOpen((v) => {
                if (v) setSearchQuery('')
                return !v
              })
            }}
            onAddCredential={() => handleAddCredential()}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
          />
        </>
      )}
    </>
  )
}
