import { useState, useRef, useCallback, useEffect } from "react";
import { dbGet, dbPut, dbPutMultiple, dbGetAllEntries } from "../utils/db.js";
import {
  deriveKey,
  encryptVaultData,
  decryptVaultData,
} from "../utils/crypto.js";
import {
  genId,
  generateHashId,
  loadSettings,
  saveSettings,
  csvEsc,
  csvParseLine,
} from "../utils/helpers.js";
import { META_KEY, VAULT_KEY, CAT_ORDER } from "../constants/index.js";

export function useVault() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [view, setView] = useState("welcome"); // 'welcome'|'detail'|'form'|'io'|'settings'|'folder'
  const [editingId, setEditingId] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState(new Set());
  const [toast, setToast] = useState({ msg: "", visible: false });
  const [authStatus, setAuthStatus] = useState({ type: "", msg: "" });

  const cryptoKeyRef = useRef(null);
  const autoLockTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  // ── Toast ──
  const showToast = useCallback((msg, duration = 2200) => {
    clearTimeout(toastTimerRef.current);
    setToast({ msg, visible: true });
    toastTimerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      duration,
    );
  }, []);

  // ── Settings / Auto-lock ──
  const getAutoLockMs = useCallback(() => {
    const mins = loadSettings().autoLockMinutes ?? 15;
    return mins === 0 ? 0 : mins * 60 * 1000;
  }, []);

  const lockVault = useCallback((reason = "") => {
    clearTimeout(autoLockTimerRef.current);
    autoLockTimerRef.current = null;
    cryptoKeyRef.current = null;
    setIsUnlocked(false);
    setCredentials([]);
    setFolders([]);
    setCurrentId(null);
    setEditingId(null);
    setCurrentFolderId(null);
    setSearchQuery("");
    if (reason === "timeout") {
      setAuthStatus({
        type: "error",
        msg: "⏱  Vault locked due to inactivity.",
      });
    } else {
      setAuthStatus({ type: "", msg: "" });
    }
  }, []);

  const startAutoLock = useCallback(() => {
    clearTimeout(autoLockTimerRef.current);
    const ms = getAutoLockMs();
    if (!ms) return;
    autoLockTimerRef.current = setTimeout(() => {
      if (cryptoKeyRef.current) lockVault("timeout");
    }, ms);
  }, [getAutoLockMs, lockVault]);

  const resetAutoLock = useCallback(() => {
    if (cryptoKeyRef.current) startAutoLock();
  }, [startAutoLock]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((evt) =>
      document.addEventListener(evt, resetAutoLock, { passive: true }),
    );
    return () =>
      events.forEach((evt) => document.removeEventListener(evt, resetAutoLock));
  }, [resetAutoLock]);

  // ── Persist ──
  const persistVault = useCallback(async (creds, folds) => {
    const payload = await encryptVaultData(cryptoKeyRef.current, {
      credentials: creds,
      folders: folds,
    });
    await dbPut(VAULT_KEY, payload);
  }, []);

  // ── View helpers ──
  const showWelcomeOrFirst = useCallback((creds, folds) => {
    setCurrentFolderId(null);
    setCurrentId(null);
    setEditingId(null);
    if (creds.length === 0 && folds.length === 0) {
      setView("welcome");
    } else if (creds.length > 0) {
      setCurrentId(creds[0].id);
      setView("detail");
    } else {
      setCurrentFolderId(folds[0].id);
      setView("folder");
    }
  }, []);

  const showDetail = useCallback(
    (id, creds) => {
      const list = creds ?? credentials;
      const cred = list.find((c) => c.id === id);
      if (!cred) {
        showWelcomeOrFirst(list, folders);
        return;
      }
      setCurrentId(id);
      setEditingId(null);
      setView("detail");
    },
    [credentials, folders, showWelcomeOrFirst],
  );

  // ── v1 migration ──
  const migrateV1 = useCallback(async () => {
    const entries = await dbGetAllEntries();
    const migrated = [];
    for (const { key, value } of entries) {
      if (key === META_KEY || key === VAULT_KEY) continue;
      try {
        const plain = await decryptVaultData(cryptoKeyRef.current, value);
        const now = Date.now();
        migrated.push({
          id: await generateHashId(plain.site, plain.user, plain.pass),
          site: plain.site || String(key),
          user: plain.user || "",
          pass: plain.pass || "",
          url: "",
          category: "Other",
          notes: "",
          createdAt: now,
          updatedAt: now,
        });
      } catch {
        /* skip */
      }
    }
    return migrated;
  }, []);

  // ── Auth ──
  const handleAuth = useCallback(
    async (pwd) => {
      if (!pwd) return;
      setAuthStatus({ type: "", msg: "" });
      try {
        let meta = await dbGet(META_KEY);
        let salt;
        if (meta) {
          salt = new Uint8Array(meta.salt);
        } else {
          salt = crypto.getRandomValues(new Uint8Array(16));
          await dbPut(META_KEY, { salt: Array.from(salt) });
        }
        cryptoKeyRef.current = await deriveKey(pwd, salt);

        const existing = await dbGet(VAULT_KEY);
        let creds = [],
          folds = [];
        if (existing) {
          try {
            const raw = await decryptVaultData(cryptoKeyRef.current, existing);
            if (Array.isArray(raw)) {
              creds = raw;
              folds = [];
            } else {
              creds = raw.credentials || [];
              folds = raw.folders || [];
            }
          } catch {
            cryptoKeyRef.current = null;
            setAuthStatus({
              type: "error",
              msg: "❌  Incorrect password — please try again.",
            });
            return { success: false };
          }
        } else {
          creds = await migrateV1();
          if (creds.length > 0) await persistVault(creds, []);
        }

        setAuthStatus({
          type: "success",
          msg: "✅  Vault unlocked successfully!",
        });
        setTimeout(() => {
          setCredentials(creds);
          setFolders(folds);
          setIsUnlocked(true);
          if (creds.length === 0 && folds.length === 0) {
            setView("welcome");
          } else if (creds.length > 0) {
            setCurrentId(creds[0].id);
            setView("detail");
          } else {
            setCurrentFolderId(folds[0].id);
            setView("folder");
          }
          startAutoLock();
        }, 650);
        return { success: true };
      } catch (err) {
        console.error(err);
        cryptoKeyRef.current = null;
        setAuthStatus({
          type: "error",
          msg: "⚠️  Crypto error — make sure you are on HTTPS or localhost.",
        });
        return { success: false };
      }
    },
    [migrateV1, persistVault, startAutoLock],
  );

  // ── Credential CRUD ──
  const saveCredential = useCallback(
    async ({ site, user, pass, url, category, notes, folderId }) => {
      if (!site || !pass) {
        showToast("Please enter at least a website name and password.");
        return false;
      }
      const now = Date.now();
      let newCreds;
      let newCurrentId;

      if (editingId) {
        newCreds = credentials.map((c) =>
          c.id === editingId
            ? {
                ...c,
                site,
                user,
                pass,
                url,
                category,
                notes,
                folderId,
                updatedAt: now,
              }
            : c,
        );
        newCurrentId = editingId;
      } else {
        const newId = await generateHashId(site, user, pass);
        if (credentials.some((c) => c.id === newId)) {
          showToast(
            "⚠️  A credential with this exact site, username, and password already exists.",
            3500,
          );
          return false;
        }
        const cred = {
          id: newId,
          site,
          user,
          pass,
          url,
          category,
          notes,
          folderId,
          createdAt: now,
          updatedAt: now,
        };
        newCreds = [...credentials, cred];
        newCurrentId = newId;
      }

      await persistVault(newCreds, folders);
      setCredentials(newCreds);
      setCurrentId(newCurrentId);
      setEditingId(null);
      setView("detail");
      showToast("Credential saved ✓");
      return true;
    },
    [credentials, folders, editingId, persistVault, showToast],
  );

  const deleteCredential = useCallback(
    async (id) => {
      if (!window.confirm("Delete this credential? This cannot be undone."))
        return;
      const newCreds = credentials.filter((c) => c.id !== id);
      await persistVault(newCreds, folders);
      setCredentials(newCreds);
      setCurrentId(null);
      setEditingId(null);
      showWelcomeOrFirst(newCreds, folders);
      showToast("Credential deleted.");
    },
    [credentials, folders, persistVault, showToast, showWelcomeOrFirst],
  );

  // ── Folder CRUD ──
  const createFolder = useCallback(
    async (name) => {
      if (!name.trim()) return null;
      const folder = {
        id: genId(),
        name: name.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const newFolders = [...folders, folder];
      await persistVault(credentials, newFolders);
      setFolders(newFolders);
      setCurrentFolderId(folder.id);
      setView("folder");
      showToast(`Folder "${folder.name}" created.`);
      return folder;
    },
    [credentials, folders, persistVault, showToast],
  );

  const renameFolder = useCallback(
    async (folderId, newName) => {
      if (!newName.trim()) return;
      const newFolders = folders.map((f) =>
        f.id === folderId
          ? { ...f, name: newName.trim(), updatedAt: Date.now() }
          : f,
      );
      await persistVault(credentials, newFolders);
      setFolders(newFolders);
      showToast(`Renamed to "${newName.trim()}".`);
    },
    [credentials, folders, persistVault, showToast],
  );

  const deleteFolder = useCallback(
    async (folderId) => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return;
      const count = credentials.filter((c) => c.folderId === folderId).length;
      const msg =
        count > 0
          ? `Delete "${folder.name}"? Its ${count} credential${count !== 1 ? "s" : ""} will be moved to "No Folder".`
          : `Delete folder "${folder.name}"?`;
      if (!window.confirm(msg)) return;
      const newCreds = credentials.map((c) =>
        c.folderId === folderId ? { ...c, folderId: null } : c,
      );
      const newFolders = folders.filter((f) => f.id !== folderId);
      await persistVault(newCreds, newFolders);
      setCredentials(newCreds);
      setFolders(newFolders);
      if (currentFolderId === folderId) {
        showWelcomeOrFirst(newCreds, newFolders);
      }
      showToast(`Folder "${folder.name}" deleted.`);
    },
    [
      credentials,
      folders,
      currentFolderId,
      persistVault,
      showToast,
      showWelcomeOrFirst,
    ],
  );

  // ── Toggle folder collapse ──
  const toggleFolderCollapse = useCallback((id) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Export / Import ──
  const exportCSV = useCallback(
    (scope, getFolderById) => {
      if (!credentials.length) {
        showToast("No credentials to export.");
        return;
      }
      let toExport;
      if (scope === "__all__") toExport = credentials;
      else if (scope === "__none__")
        toExport = credentials.filter((c) => !c.folderId);
      else toExport = credentials.filter((c) => c.folderId === scope);
      if (!toExport.length) {
        showToast("No credentials match the selected scope.");
        return;
      }

      const header = "site,user,pass,url,category,notes,folder";
      const rows = toExport.map((c) => {
        const folderName = c.folderId
          ? getFolderById(c.folderId)?.name || ""
          : "";
        return [
          c.site,
          c.user,
          c.pass,
          c.url || "",
          c.category || "",
          c.notes || "",
          folderName,
        ]
          .map(csvEsc)
          .join(",");
      });
      let suffix = "";
      if (scope === "__none__") suffix = "-unfiled";
      else if (scope !== "__all__") {
        const f = getFolderById(scope);
        if (f) suffix = `-${f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      }
      const blob = new Blob([[header, ...rows].join("\n")], {
        type: "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `keyvault-export${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
      });
      a.click();
      URL.revokeObjectURL(url);
      showToast(
        `Exported ${toExport.length} credential${toExport.length !== 1 ? "s" : ""}.`,
      );
    },
    [credentials, showToast],
  );

  const importCSV = useCallback(
    async (text, importMode, importOverrideId) => {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) {
        showToast("CSV file appears empty.");
        return;
      }
      const headers = csvParseLine(lines[0]).map((h) => h.toLowerCase().trim());
      const idx = (name) => headers.indexOf(name);
      const si = idx("site"),
        pi = idx("pass");
      if (si < 0 || pi < 0) {
        showToast('"site" and "pass" columns are required.');
        return;
      }

      let added = 0,
        skipped = 0;
      const now = Date.now();
      const folderNameMap = new Map(
        folders.map((f) => [f.name.toLowerCase(), f.id]),
      );
      let newCreds = [...credentials];
      let newFolders = [...folders];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = csvParseLine(lines[i]);
        const site = cols[si]?.trim();
        const pass = cols[pi]?.trim();
        if (!site || !pass) continue;
        const user = idx("user") >= 0 ? (cols[idx("user")] || "").trim() : "";
        const id = await generateHashId(site, user, pass);
        if (newCreds.some((c) => c.id === id)) {
          skipped++;
          continue;
        }

        let folderId = null;
        if (importMode === "override") {
          folderId = importOverrideId || null;
        } else {
          const fi = idx("folder");
          if (fi >= 0) {
            const folderName = (cols[fi] || "").trim();
            if (folderName) {
              const key = folderName.toLowerCase();
              if (folderNameMap.has(key)) {
                folderId = folderNameMap.get(key);
              } else {
                const nf = {
                  id: genId(),
                  name: folderName,
                  createdAt: now,
                  updatedAt: now,
                };
                newFolders.push(nf);
                folderNameMap.set(key, nf.id);
                folderId = nf.id;
              }
            }
          }
        }
        newCreds.push({
          id,
          site,
          user,
          pass,
          folderId,
          url: idx("url") >= 0 ? (cols[idx("url")] || "").trim() : "",
          category:
            idx("category") >= 0
              ? (cols[idx("category")] || "Other").trim()
              : "Other",
          notes: idx("notes") >= 0 ? (cols[idx("notes")] || "").trim() : "",
          createdAt: now,
          updatedAt: now,
        });
        added++;
      }

      if (added > 0) {
        await persistVault(newCreds, newFolders);
        setCredentials(newCreds);
        setFolders(newFolders);
      }

      const parts = [];
      if (added > 0) parts.push(`${added} added`);
      if (skipped > 0)
        parts.push(`${skipped} skipped (duplicate${skipped !== 1 ? "s" : ""})`);
      showToast(
        `Import complete: ${parts.length ? parts.join(", ") : "No new credentials found."}`,
        3500,
      );

      if (newCreds.length > 0 && !currentId) {
        setCurrentId(newCreds[0].id);
        setView("detail");
      }
    },
    [credentials, folders, currentId, persistVault, showToast],
  );

  // ── Change Password ──
  const changePassword = useCallback(
    async (curPwd, newPwd, confPwd) => {
      if (!curPwd || !newPwd || !confPwd)
        return { error: "Please fill in all three password fields." };
      if (newPwd !== confPwd)
        return { error: "❌  New passwords do not match." };
      if (newPwd.length < 8)
        return { error: "❌  New password must be at least 8 characters." };
      try {
        const meta = await dbGet(META_KEY);
        if (!meta) throw new Error("Meta record not found.");
        const testKey = await deriveKey(curPwd, new Uint8Array(meta.salt));
        const vault = await dbGet(VAULT_KEY);
        if (vault) {
          try {
            await crypto.subtle.decrypt(
              { name: "AES-GCM", iv: new Uint8Array(vault.iv) },
              testKey,
              new Uint8Array(vault.data),
            );
          } catch {
            return { error: "❌  Current password is incorrect." };
          }
        }
        const newSalt = crypto.getRandomValues(new Uint8Array(16));
        const newKey = await deriveKey(newPwd, newSalt);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          newKey,
          new TextEncoder().encode(JSON.stringify({ credentials, folders })),
        );
        const newVaultPayload = {
          iv: Array.from(iv),
          data: Array.from(new Uint8Array(encrypted)),
        };
        await dbPutMultiple([
          { key: META_KEY, value: { salt: Array.from(newSalt) } },
          { key: VAULT_KEY, value: newVaultPayload },
        ]);
        cryptoKeyRef.current = newKey;
        showToast("Master password updated.");
        return { success: true };
      } catch (err) {
        console.error(err);
        return { error: "⚠️  An unexpected error occurred. Please try again." };
      }
    },
    [credentials, folders, showToast],
  );

  // ── Save auto-lock setting ──
  const saveAutoLockSetting = useCallback(
    (val) => {
      const settings = loadSettings();
      settings.autoLockMinutes = val;
      saveSettings(settings);
      startAutoLock();
      const TIMEOUT_OPTIONS = [
        { label: "1 minute", value: 1 },
        { label: "5 minutes", value: 5 },
        { label: "15 minutes", value: 15 },
        { label: "30 minutes", value: 30 },
        { label: "1 hour", value: 60 },
        { label: "4 hours", value: 240 },
        { label: "Never", value: 0 },
      ];
      const opt = TIMEOUT_OPTIONS.find((o) => o.value === val);
      showToast(
        val === 0
          ? "Auto-lock disabled."
          : `Auto-lock set to ${opt ? opt.label : val + " min"}.`,
      );
    },
    [startAutoLock, showToast],
  );

  return {
    // state
    isUnlocked,
    credentials,
    folders,
    currentId,
    view,
    editingId,
    currentFolderId,
    searchQuery,
    collapsedFolders,
    toast,
    authStatus,
    // setters
    setCurrentId,
    setView,
    setEditingId,
    setCurrentFolderId,
    setSearchQuery,
    setAuthStatus,
    // actions
    handleAuth,
    lockVault,
    saveCredential,
    deleteCredential,
    createFolder,
    renameFolder,
    deleteFolder,
    toggleFolderCollapse,
    exportCSV,
    importCSV,
    changePassword,
    saveAutoLockSetting,
    showToast,
    showDetail,
    showWelcomeOrFirst,
  };
}
