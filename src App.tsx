import React, { useState, useRef, useCallback } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Upload, 
  FileText, 
  Hash, 
  Clock, 
  Database,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  Moon,
  Sun
} from 'lucide-react';

interface FileRecord {
  path: string;
  hash: string;
  size: number;
  added_date: string;
  last_checked: string;
  status: 'verified' | 'tampered' | 'unknown' | 'missing';
  description: string;
  check_count: number;
}

interface VerificationResult {
  status: 'verified' | 'tampered' | 'unknown' | 'error' | 'missing';
  message: string;
  hash?: string;
  expected_hash?: string;
  current_hash?: string;
  tampered_date?: string;
}

function App() {
  const [isDark, setIsDark] = useState(false);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock functions - in a real implementation, these would communicate with the Python backend
  const calculateFileHash = useCallback(async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  const addFileToDatabase = useCallback(async (file: File, description: string = '') => {
    setIsLoading(true);
    try {
      const hash = await calculateFileHash(file);
      const newFile: FileRecord = {
        path: file.name,
        hash,
        size: file.size,
        added_date: new Date().toISOString(),
        last_checked: new Date().toISOString(),
        status: 'verified',
        description,
        check_count: 1
      };
      setFiles(prev => [...prev, newFile]);
    } catch (error) {
      console.error('Error adding file:', error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateFileHash]);

  const verifyFile = useCallback(async (file: File, record: FileRecord): Promise<VerificationResult> => {
    try {
      const currentHash = await calculateFileHash(file);
      if (currentHash === record.hash) {
        return {
          status: 'verified',
          message: 'File integrity verified',
          hash: currentHash
        };
      } else {
        return {
          status: 'tampered',
          message: 'File has been modified',
          expected_hash: record.hash,
          current_hash: currentHash,
          tampered_date: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Could not verify file'
      };
    }
  }, [calculateFileHash]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      addFileToDatabase(file);
    }
  }, [addFileToDatabase]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      addFileToDatabase(file);
    }
  }, [addFileToDatabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'tampered':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Hash className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'tampered':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'missing':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const stats = {
    total: files.length,
    verified: files.filter(f => f.status === 'verified').length,
    tampered: files.filter(f => f.status === 'tampered').length,
    unknown: files.filter(f => f.status === 'unknown').length
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">File Integrity Checker</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Detect file tampering through hash comparison
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl border transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Files</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl border transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Verified</p>
                <p className="text-2xl font-bold text-green-500">{stats.verified}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl border transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tampered</p>
                <p className="text-2xl font-bold text-red-500">{stats.tampered}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl border transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center">
              <Hash className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Unknown</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.unknown}</p>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-8">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : isDark 
                  ? 'border-gray-600 bg-gray-800 hover:border-gray-500' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInput}
              accept="*/*"
            />
            
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${dragActive ? 'text-blue-700' : ''}`}>
              {dragActive ? 'Drop file here' : 'Upload File for Integrity Checking'}
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Drag and drop a file here, or click to select
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Processing...' : 'Select File'}
            </button>
          </div>
        </div>

        {/* Files List */}
        <div className={`rounded-xl border transition-colors duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">File Database</h2>
              <div className="flex space-x-2">
                <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <Download className="w-4 h-4 inline mr-2" />
                  Export
                </button>
                <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Verify All
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {files.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No files in database</h3>
                <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Upload a file to get started with integrity checking</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>File</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Size</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last Checked</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Checks</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {files.map((file, index) => (
                    <tr key={index} className={`hover:${isDark ? 'bg-gray-750' : 'bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(file.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(file.status)}`}>
                            {file.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div>
                            <div className="text-sm font-medium">{file.path}</div>
                            {file.description && (
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{file.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatFileSize(file.size)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {formatDate(file.last_checked)}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {file.check_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button className="text-blue-500 hover:text-blue-700 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button className="text-red-500 hover:text-red-700 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;