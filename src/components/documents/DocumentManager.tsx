'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Document, Folder, DocumentType } from '@/types';
import { documentService, folderService } from '@/config/firestore';
import googleApiService from '@/services/googleApi';

interface DocumentManagerProps {
  className?: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (user) {
      loadDocuments();
      loadFolders();
    }
  }, [user, currentFolder]);

  const loadDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userDocs = await documentService.getDocumentsForUser(user.uid);
      const sharedDocs = await documentService.getSharedDocumentsForUser(user.uid);
      
      // Filter by current folder if selected
      let filteredDocs = [...userDocs, ...sharedDocs];
      if (currentFolder) {
        filteredDocs = filteredDocs.filter(doc => doc.folderId === currentFolder.id);
      } else {
        filteredDocs = filteredDocs.filter(doc => !doc.folderId);
      }
      
      setDocuments(filteredDocs);
    } catch (error: any) {
      setError(error.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    if (!user) return;
    
    try {
      const userFolders = await folderService.getFoldersForUser(user.uid);
      
      // Filter by current folder if selected
      let filteredFolders = userFolders;
      if (currentFolder) {
        filteredFolders = userFolders.filter(folder => folder.parentId === currentFolder.id);
      } else {
        filteredFolders = userFolders.filter(folder => !folder.parentId);
      }
      
      setFolders(filteredFolders);
    } catch (error: any) {
      setError(error.message || 'Failed to load folders');
    }
  };

  const handleCreateFolder = async (name: string) => {
    if (!user) return;
    
    try {
      await folderService.createFolder({
        name,
        parentId: currentFolder?.id,
        path: currentFolder ? `${currentFolder.path}/${name}` : name,
        ownerId: user.uid,
        sharedWith: [],
        permissions: [],
        documentCount: 0,
        subfolderCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      await loadFolders();
      setShowCreateFolderModal(false);
    } catch (error: any) {
      setError(error.message || 'Failed to create folder');
    }
  };

  const handleUploadFile = async (file: File) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // For demo purposes, we'll create a document record without actual file upload
      // In production, this would upload to Firebase Storage and/or Google Drive
      const documentData: Omit<Document, 'id'> = {
        name: file.name,
        type: getDocumentType(file.type),
        mimeType: file.type,
        size: file.size,
        url: '#', // Would be actual file URL
        folderId: currentFolder?.id,
        ownerId: user.uid,
        sharedWith: [],
        permissions: [],
        tags: [],
        version: 1,
        versions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          originalName: file.name,
          uploadedBy: user.uid,
        },
      };
      
      await documentService.createDocument(documentData);
      await loadDocuments();
      setShowUploadModal(false);
    } catch (error: any) {
      setError(error.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentType = (mimeType: string): DocumentType => {
    if (mimeType.startsWith('image/')) return DocumentType.IMAGE;
    if (mimeType.startsWith('video/')) return DocumentType.VIDEO;
    if (mimeType === 'application/pdf') return DocumentType.PDF;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return DocumentType.SPREADSHEET;
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return DocumentType.PRESENTATION;
    if (mimeType.includes('document') || mimeType.includes('word')) return DocumentType.DOCUMENT;
    return DocumentType.OTHER;
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.DOCUMENT:
        return (
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case DocumentType.SPREADSHEET:
        return (
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case DocumentType.PDF:
        return (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case DocumentType.IMAGE:
        return (
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <div className="flex items-center text-sm text-gray-500">
            <button 
              onClick={() => setCurrentFolder(null)}
              className="hover:text-primary-600"
            >
              Home
            </button>
            {currentFolder && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{currentFolder.name}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-64 pl-10"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-md overflow-hidden border border-gray-300">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="btn-outline"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Folder
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-md p-4">
          <p className="text-sm text-error-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-error-800 hover:text-error-900 text-sm font-medium mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Folders and Documents Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Folders */}
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => setCurrentFolder(folder)}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <svg className="w-12 h-12 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-900 truncate w-full">{folder.name}</p>
                <p className="text-xs text-gray-500">{folder.documentCount} files</p>
              </div>
            </div>
          ))}

          {/* Documents */}
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                {getDocumentIcon(document.type)}
                <p className="text-sm font-medium text-gray-900 truncate w-full mt-2">{document.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(document.size)}</p>
                <p className="text-xs text-gray-400">{formatDate(document.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {folders.map((folder) => (
                <tr key={folder.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center cursor-pointer" onClick={() => setCurrentFolder(folder)}>
                      <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">{folder.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Folder</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{folder.documentCount} items</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(folder.updatedAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">More</button>
                  </td>
                </tr>
              ))}
              
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-3">{getDocumentIcon(document.type)}</div>
                      <span className="text-sm font-medium text-gray-900">{document.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(document.size)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(document.updatedAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">Download</button>
                    <button className="text-primary-600 hover:text-primary-900">More</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {folders.length === 0 && filteredDocuments.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading a document or creating a folder.</p>
          <div className="mt-6 flex justify-center space-x-3">
            <button onClick={() => setShowUploadModal(true)} className="btn-primary">
              Upload Document
            </button>
            <button onClick={() => setShowCreateFolderModal(true)} className="btn-outline">
              Create Folder
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadFile}
        />
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <CreateFolderModal
          onClose={() => setShowCreateFolderModal(false)}
          onCreate={handleCreateFolder}
        />
      )}
    </div>
  );
};

// Upload Modal Component
const UploadModal: React.FC<{
  onClose: () => void;
  onUpload: (file: File) => void;
}> = ({ onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
            }`}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">Drag and drop a file here, or</p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer text-primary-600 hover:text-primary-500">
                  browse to upload
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="btn-primary"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Folder Modal Component
const CreateFolderModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string) => void;
}> = ({ onClose, onCreate }) => {
  const [folderName, setFolderName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreate(folderName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Folder</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder Name
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="input w-full"
                placeholder="Enter folder name"
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="btn-outline">
                Cancel
              </button>
              <button
                type="submit"
                disabled={!folderName.trim()}
                className="btn-primary"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;