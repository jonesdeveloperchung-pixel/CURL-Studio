"use client";

import React, { useState, useCallback, useEffect } from 'react';
import {
  Settings,
  Send,
  Plus,
  Loader2,
  Globe,
  Trash2,
  Terminal,
  Clock,
  Zap,
  History as HistoryIcon,
  FolderOpen,
  Copy,
  Check,
  Sparkles,
  Languages
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { translations, Locale } from "@/lib/i18n";

// --- Types ---
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type Flavor = 'curl' | 'powershell';

interface KVField {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface HistoryItem {
  id: string;
  method: Method;
  url: string;
  timestamp?: number;
  createdAt?: string;
  status: number;
}

interface RequestItem {
  id: string;
  name: string | null;
  method: string;
  url: string;
  headers: string;
  body: string | null;
  collectionId: string | null;
}

interface CollectionItem {
  id: string;
  name: string;
  requests: RequestItem[];
}

interface ResponseMetadata {
  status: number;
  time: number;
  size: string;
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all w-full",
      active
        ? "bg-white/10 text-white shadow-inner"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export default function ApiStudio() {
  // --- i18n ---
  const [locale, setLocale] = useLocalStorage<Locale>("curl_studio_locale", "zh-TW");
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const t = translations[locale];

  // --- State ---
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState<KVField[]>([{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }]);
  const [params, setParams] = useState<KVField[]>([]);
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('headers');
  const [flavor, setFlavor] = useState<Flavor>('curl');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [resMetadata, setResMetadata] = useState<ResponseMetadata | null>(null);
  const [copied, setCopied] = useState(false);
  const [resCopied, setResCopied] = useState(false);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!loading) sendRequest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, method, url, headers, body]);

  // --- Persistence ---
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isSavingRequest, setIsSavingRequest] = useState(false);
  const [saveRequestName, setSaveRequestName] = useState("");
  const [targetCollectionId, setTargetCollectionId] = useState("");

  const [envVariables, setEnvVariables] = useLocalStorage<KVField[]>("curl_studio_envs", [
    { id: '1', key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true }
  ]);

  // Load History from SQLite
  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setHistory(data);
      });
    
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCollections(data);
      });
  }, []);

  // --- Ollama State ---
  const [ollamaIp, setOllamaIp] = useLocalStorage<string>("curl_studio_ollama_ip", "localhost");
  const [ollamaModel, setOllamaModel] = useLocalStorage<string>("curl_studio_ollama_model", "qwen2.5-coder:latest");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOnline, setAiOnline] = useState(false);
  const [systemHealth, setSystemHealth] = useState({ curl: true, activeEngine: 'curl-binary', database: true });

  // System Health Check
  const checkSystemHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      setSystemHealth(data);
    } catch (e) {
      setSystemHealth({ curl: false, activeEngine: 'native-fetch', database: false });
    }
  }, []);

  // AI Connection Check
  const checkAiConnection = useCallback(async () => {
    if (!ollamaIp) return;
    try {
      const res = await fetch(`/api/ai/models?ip=${ollamaIp}`);
      const data = await res.json();
      if (data.models) {
        setAvailableModels(data.models);
        setAiOnline(true);
      } else {
        setAiOnline(false);
      }
    } catch (e) {
      setAiOnline(false);
    }
  }, [ollamaIp]);

  useEffect(() => {
    checkSystemHealth();
    checkAiConnection();
    const interval = setInterval(() => {
      checkSystemHealth();
      checkAiConnection();
    }, 10000);
    return () => clearInterval(interval);
  }, [checkSystemHealth, checkAiConnection]);

  // Variable Resolver
  const resolveVariables = useCallback((text: string) => {
    let resolved = text;
    envVariables.filter(v => v.enabled && v.key).forEach(v => {
      resolved = resolved.split(`{{${v.key}}}`).join(v.value);
    });
    return resolved;
  }, [envVariables]);

  // Field Helpers
  const addField = (setter: React.Dispatch<React.SetStateAction<KVField[]>>) => {
    setter(prev => [...prev, { id: Math.random().toString(), key: '', value: '', enabled: true }]);
  };

  const removeField = (setter: React.Dispatch<React.SetStateAction<KVField[]>>, id: string) => {
    setter(prev => prev.filter(f => f.id !== id));
  };

  const updateField = (setter: React.Dispatch<React.SetStateAction<KVField[]>>, id: string, data: Partial<KVField>) => {
    setter(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
  };

  // Command Generation
  const generateCommand = useCallback(() => {
    const resolvedUrl = resolveVariables(url);
    if (flavor === 'curl') {
      let cmd = `curl -X ${method} "${resolvedUrl}"`;
      headers.filter(h => h.enabled && h.key).forEach(h => {
        cmd += ` -H "${h.key}: ${resolveVariables(h.value)}"`;
      });
      if (body && method !== 'GET') {
        const escapedBody = body.replace(/'/g, "'\\''");
        cmd += ` -d '${escapedBody}'`;
      }
      return cmd;
    } else {
      let cmd = `Invoke-WebRequest -Method ${method} -Uri "${resolvedUrl}"`;
      const hMap = headers.filter(h => h.enabled && h.key);
      if (hMap.length > 0) {
        cmd += ` -Headers @{ ${hMap.map(h => `"${h.key}"="${resolveVariables(h.value)}"`).join('; ')} }`;
      }
      if (body && method !== 'GET') {
        cmd += ` -Body '${body}'`;
      }
      return cmd;
    }
  }, [method, url, headers, body, flavor, resolveVariables]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setResCopied(true);
    setTimeout(() => setResCopied(false), 2000);
  };

  const downloadResponse = () => {
    if (!response) return;
    const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Collection Actions ---
  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionName })
      });
      const data = await res.json();
      setCollections(prev => [{ ...data, requests: [] }, ...prev]);
      setNewCollectionName("");
      setIsAddingCollection(false);
    } catch (error) {
      console.error("Failed to create collection", error);
    }
  };

  const saveRequestToCollection = async () => {
    if (!saveRequestName.trim() || !targetCollectionId) return;
    try {
      const res = await fetch(`/api/collections/${targetCollectionId}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveRequestName,
          method,
          url,
          headers: headers.filter(h => h.enabled && h.key).reduce((acc: Record<string, string>, h) => {
            acc[h.key] = h.value;
            return acc;
          }, {}),
          body: method !== 'GET' ? body : undefined
        })
      });
      const data = await res.json();
      setCollections(prev => prev.map(c => 
        c.id === targetCollectionId ? { ...c, requests: [data, ...c.requests] } : c
      ));
      setSaveRequestName("");
      setIsSavingRequest(false);
    } catch (error) {
      console.error("Failed to save request", error);
    }
  };

  const loadRequest = (req: RequestItem | HistoryItem) => {
    setMethod(req.method as Method);
    setUrl(req.url);
    if ('headers' in req && typeof req.headers === 'string') {
      try {
        const parsedHeaders = JSON.parse(req.headers);
        setHeaders(Object.entries(parsedHeaders).map(([key, value]) => ({
          id: Math.random().toString(),
          key,
          value: value as string,
          enabled: true
        })));
      } catch (e) {
        console.error("Failed to parse headers", e);
      }
      setBody(req.body || "");
    }
  };

  // Execution
  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setResMetadata(null);
    const startTime = Date.now();

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url: resolveVariables(url),
          headers: headers.filter(h => h.enabled && h.key).reduce((acc: Record<string, string>, h) => {
            acc[h.key] = resolveVariables(h.value);
            return acc;
          }, {}),
          body: method !== 'GET' ? body : undefined
        })
      });

      const data = await res.json();
      const endTime = Date.now();

      if (!res.ok) throw new Error(data.error || 'Execution failed');

      setResponse(data.body);
      const metadata = {
        status: data.status,
        time: endTime - startTime,
        size: data.size || (JSON.stringify(data.body).length / 1024).toFixed(2) + ' KB'
      };
      setResMetadata(metadata);

      // Save to SQLite
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url,
          status: data.status,
          time: metadata.time,
          size: metadata.size
        })
      }).then(res => res.json()).then(newItem => {
        setHistory(prev => [newItem, ...prev].slice(0, 50));
      });

    } catch (err: unknown) {
      setResponse({ error: err instanceof Error ? err.message : String(err) });
      setResMetadata({ status: 0, time: Date.now() - startTime, size: '0 KB' });
    } finally {
      setLoading(false);
    }
  };

  // AI Generation
  const generateWithAi = async () => {
    if (!aiPrompt || !aiPrompt.trim()) return;
    if (!availableModels.includes(ollamaModel)) {
      alert(t.modelNotFound);
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ollamaIp,
          model: ollamaModel,
          prompt: aiPrompt
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data || typeof data.response !== 'string') {
        throw new Error(data.error || "Invalid response from AI engine");
      }

      // Try to extract JSON from the response (sometimes AI adds markdown)
      let responseText = data.response.trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }

      const generated = JSON.parse(responseText);

      if (generated.method) setMethod(generated.method.toUpperCase() as Method);
      if (generated.url) setUrl(generated.url);
      if (generated.headers) {
        setHeaders(Object.entries(generated.headers).map(([key, value]) => ({
          id: Math.random().toString(),
          key,
          value: value as string,
          enabled: true
        })));
      }
      if (generated.body) setBody(typeof generated.body === 'string' ? generated.body : JSON.stringify(generated.body, null, 2));
      
      setAiPrompt("");
      setSidebarView('collections');
    } catch (err) {
      console.error("AI Generation failed", err);
      alert(err instanceof Error ? err.message : "AI Generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  // View State
  const [sidebarView, setSidebarView] = useState<'collections' | 'history' | 'envs' | 'settings' | 'ai'>('collections');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = history.filter(item => 
    item.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCollections = collections.map(col => ({
    ...col,
    requests: col.requests.filter(req => 
      req.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(col => col.requests.length > 0 || col.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!mounted) return <div className="h-screen w-full bg-slate-950" />;

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Terminal className="text-white w-6 h-6" />
          </div>
          <h1 className="font-bold text-lg tracking-tight gradient-text">{t.appName}</h1>
        </div>
        
        <nav className="flex flex-col gap-1 w-full">
          <SidebarItem icon={FolderOpen} label={t.collections} active={sidebarView === 'collections'} onClick={() => setSidebarView('collections')} />
          <SidebarItem icon={HistoryIcon} label={t.history} active={sidebarView === 'history'} onClick={() => setSidebarView('history')} />
          <SidebarItem icon={Globe} label={t.environments} active={sidebarView === 'envs'} onClick={() => setSidebarView('envs')} />
          <div className="relative group">
            <SidebarItem 
              icon={Sparkles} 
              label={t.aiAssistant} 
              active={sidebarView === 'ai'} 
              onClick={() => aiOnline && setSidebarView('ai')} 
            />
            {!aiOnline && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[8px] font-black uppercase">
                Offline
              </div>
            )}
          </div>
          <SidebarItem icon={Settings} label={t.settings} active={sidebarView === 'settings'} onClick={() => setSidebarView('settings')} />
        </nav>

        {/* Sidebar Context View */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 py-4 border-t border-white/5">
          {['history', 'collections'].includes(sidebarView) && (
            <div className="mb-4 px-2">
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
          )}
          {sidebarView === 'history' && (
            <div className="space-y-2">
              {filteredHistory.map(item => (
                <button key={item.id} onClick={() => loadRequest(item)} className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-all group">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className={cn(
                                        "text-[9px] font-black uppercase px-1.5 py-0.5 rounded",
                                        item.method === 'GET' ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                                      )}>{item.method}</span>
                                      <span className="text-[8px] text-slate-600">
                                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 
                                         item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : ""}
                                      </span>
                                    </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">{item.url}</div>
                </button>
              ))}
            </div>
          )}

          {sidebarView === 'envs' && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">{t.globalVariables}</h4>
              {envVariables.map(v => (
                <div key={v.id} className="px-2 space-y-1 group">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-mono text-purple-400">{`{{`}{v.key}{`}}`}</span>
                    <button onClick={() => removeField(setEnvVariables, v.id)} className="opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3 text-slate-600 hover:text-red-400" /></button>
                  </div>
                  <input value={v.value} onChange={(e) => updateField(setEnvVariables, v.id, { value: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-purple-500/50" />
                </div>
              ))}
              <button onClick={() => addField(setEnvVariables)} className="w-full py-2 text-[9px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest border border-dashed border-white/5 rounded-lg transition-all">{t.addVariable}</button>
            </div>
          )}

          {sidebarView === 'settings' && (
            <div className="space-y-6 px-2">
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Languages className="w-3 h-3" /> Language</h4>
                <div className="flex bg-slate-900 rounded-lg p-1">
                  {(['zh-TW', 'en'] as Locale[]).map(l => (
                    <button key={l} onClick={() => setLocale(l)} className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all", locale === l ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300")}>
                      {l === 'zh-TW' ? '中文' : 'EN'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Globe className="w-3 h-3" /> {t.ollamaSettings}</h4>
                <input 
                  value={ollamaIp} 
                  onChange={(e) => setOllamaIp(e.target.value)} 
                  placeholder="localhost or IP"
                  className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50" 
                />
                
                {availableModels.length > 0 && (
                  <select value={ollamaModel} onChange={(e) => setOllamaModel(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50">
                    {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                )}
                
                <p className="text-[9px] text-slate-600 italic">Current AI Node: {ollamaIp}</p>
              </div>
            </div>
          )}

          {sidebarView === 'ai' && (
            <div className="space-y-4 px-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.aiAssistant}</h4>
              <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder={t.promptPlaceholder} className="w-full h-32 bg-slate-900 border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500/50 resize-none custom-scrollbar" />
              <button onClick={generateWithAi} disabled={aiLoading || !aiPrompt || !aiPrompt.trim()} className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-2 transition-all">
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {t.generate}
              </button>
            </div>
          )}

          {sidebarView === 'collections' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.collections}</h4>
                <button onClick={() => setIsAddingCollection(true)} className="p-1 hover:bg-white/10 rounded transition-all">
                  <Plus className="w-3 h-3 text-blue-400" />
                </button>
              </div>
              
              {isAddingCollection && (
                <div className="px-2 space-y-2">
                  <input autoFocus value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createCollection()} placeholder={t.collectionName} className="w-full bg-slate-900 border border-blue-500/30 rounded px-2 py-1.5 text-xs focus:outline-none" />
                  <div className="flex gap-2">
                    <button onClick={createCollection} className="flex-1 py-1 bg-blue-600 rounded text-[10px] font-bold uppercase">{t.save}</button>
                    <button onClick={() => setIsAddingCollection(false)} className="flex-1 py-1 bg-slate-800 rounded text-[10px] font-bold uppercase">{t.cancel}</button>
                  </div>
                </div>
              )}

              {filteredCollections.length === 0 && !isAddingCollection ? (
                <div className="flex flex-col items-center justify-center h-32 opacity-20">
                  <FolderOpen className="w-8 h-8 mb-2" />
                  <p className="text-[10px] font-bold uppercase">{t.noCollections}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCollections.map(col => (
                    <div key={col.id} className="space-y-1">
                      <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 bg-white/5 rounded-lg">
                        <FolderOpen className="w-3 h-3" />
                        {col.name}
                      </div>
                      <div className="pl-4 space-y-1">
                        {col.requests.map(req => (
                          <button key={req.id} onClick={() => loadRequest(req)} className="w-full text-left px-3 py-1.5 rounded-md hover:bg-white/5 transition-all flex items-center justify-between group">
                            <span className="text-[10px] text-slate-500 truncate">{req.name || req.url}</span>
                            <span className="text-[8px] font-bold text-blue-400 opacity-0 group-hover:opacity-100 uppercase">{req.method}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 shrink-0">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2">{t.systemStatus}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", systemHealth.curl ? "bg-green-500 animate-pulse" : "bg-blue-500")} />
              <span className="text-[10px] font-medium text-slate-400">
                {systemHealth.curl ? t.engineReady : "Fallback Engine (Fetch)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", aiOnline ? "bg-purple-500 animate-pulse" : "bg-slate-700")} />
              <span className="text-[10px] font-medium text-slate-400">
                {aiOnline ? t.aiReady : t.aiOffline}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.workspace} / {sidebarView.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className={cn(
               "px-3 py-1 rounded-full border text-[10px] font-bold uppercase transition-all",
               systemHealth.curl ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500"
             )}>
               {systemHealth.curl ? t.connected : "PROG-MODE"}
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
          {/* Top: Request Section */}
          <div className="glass rounded-2xl flex flex-col shrink-0 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex gap-3 bg-white/5">
              <select value={method} onChange={(e) => setMethod(e.target.value as Method)} className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer">
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="flex-1 relative">
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                {url.includes('{{') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <span className="text-[8px] font-black text-purple-500 uppercase bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">Vars Active</span>
                  </div>
                )}
              </div>
              <button onClick={() => setIsSavingRequest(true)} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-all" title={t.saveToCollection}>
                <Plus className="w-5 h-5" />
              </button>
              <button onClick={sendRequest} disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 px-8 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {t.send}
              </button>
            </div>

            <div className="h-64 flex flex-col overflow-hidden">
              <div className="flex border-b border-white/5 px-4 bg-white/5 shrink-0">
                {[ { id: 'params', label: t.params }, { id: 'headers', label: t.headers }, { id: 'body', label: t.body }].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn("px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2", activeTab === tab.id ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-300")}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {activeTab !== 'body' ? (
                  <div className="space-y-3">
                    {(activeTab === 'headers' ? headers : params).map((field) => (
                      <div key={field.id} className="flex gap-3 group items-center">
                        <input type="checkbox" checked={field.enabled} onChange={(e) => updateField(activeTab === 'headers' ? setHeaders : setParams, field.id, { enabled: e.target.checked })} className="rounded border-white/10 bg-slate-900 text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer" />
                        <input value={field.key} onChange={(e) => updateField(activeTab === 'headers' ? setHeaders : setParams, field.id, { key: e.target.value })} placeholder="Key" className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50" />
                        <input value={field.value} onChange={(e) => updateField(activeTab === 'headers' ? setHeaders : setParams, field.id, { value: e.target.value })} placeholder="Value" className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50" />
                        <button onClick={() => removeField(activeTab === 'headers' ? setHeaders : setParams, field.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => addField(activeTab === 'headers' ? setHeaders : setParams)} className="flex items-center gap-2 text-[10px] text-blue-500 hover:text-blue-400 font-bold uppercase tracking-widest py-2 px-1 transition-all"><Plus className="w-3 h-3" /> {t.addRow}</button>
                  </div>
                ) : (
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder='{"key": "value"}' className="w-full h-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-xs font-mono text-blue-100 focus:outline-none focus:border-blue-500/50 resize-none custom-scrollbar" />
                )}
              </div>
            </div>

            {/* Command Preview */}
            <div className="p-4 bg-black/40 border-t border-white/5 flex items-center gap-4">
              <div className="flex bg-slate-900 rounded-lg p-1">
                {(['curl', 'powershell'] as Flavor[]).map(f => (
                  <button key={f} onClick={() => setFlavor(f)} className={cn("px-3 py-1 text-[9px] font-bold uppercase tracking-tighter rounded-md transition-all", flavor === f ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300")}>
                    {f === 'curl' ? 'cURL' : 'PowerShell'}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-x-auto custom-scrollbar whitespace-nowrap text-[10px] font-mono text-slate-500 py-1">{generateCommand()}</div>
              <button onClick={copyToClipboard} className="p-2 hover:bg-white/5 rounded-lg transition-all text-slate-400 hover:text-blue-400 relative" title={t.copyCurl}>
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bottom: Response Section */}
          <div className="flex-1 glass rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.responseOutput}</h3>
              <div className="flex items-center gap-4">
                {Boolean(response) && (
                  <div className="flex items-center gap-1 border-r border-white/10 pr-4 mr-2">
                    <button onClick={copyResponse} className="p-1.5 hover:bg-white/10 rounded transition-all text-slate-400 hover:text-blue-400" title="Copy Response">
                      {resCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={downloadResponse} className="p-1.5 hover:bg-white/10 rounded transition-all text-slate-400 hover:text-blue-400" title="Download JSON">
                      <Plus className="w-3.5 h-3.5 rotate-45" />
                    </button>
                  </div>
                )}
                {resMetadata && (
                  <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">{t.status}:</span>
                      <span className={cn("text-xs font-black", resMetadata.status >= 200 && resMetadata.status < 300 ? "text-emerald-400" : "text-red-400")}>{resMetadata.status || 'ERROR'}</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-white/10 pl-6"><Clock className="w-3 h-3 text-slate-500" /><span className="text-xs font-bold text-slate-300">{resMetadata.time} <span className="text-[9px] text-slate-500">MS</span></span></div>
                    <div className="flex items-center gap-2 border-l border-white/10 pl-6"><Zap className="w-3 h-3 text-slate-500" /><span className="text-xs font-bold text-slate-300">{resMetadata.size}</span></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-slate-900/20">
              {response ? (
                <pre className="text-xs font-mono text-blue-200 whitespace-pre-wrap leading-relaxed">{JSON.stringify(response, null, 2)}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <Globe className="w-16 h-16 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">{t.readyForTransmission}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Request Modal */}
        {isSavingRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass w-full max-w-md rounded-2xl p-6 space-y-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200">
              <h3 className="text-lg font-bold text-white">{t.saveToCollection}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.requestName}</label>
                  <input autoFocus value={saveRequestName} onChange={(e) => setSaveRequestName(e.target.value)} placeholder="My Request" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.collections}</label>
                  <select value={targetCollectionId} onChange={(e) => setTargetCollectionId(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select a collection</option>
                    {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={saveRequestToCollection} disabled={!saveRequestName.trim() || !targetCollectionId} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 rounded-xl text-sm font-bold text-white transition-all">{t.save}</button>
                <button onClick={() => setIsSavingRequest(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-300 transition-all">{t.cancel}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}