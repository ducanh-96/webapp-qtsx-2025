import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import { User, Document, Folder, UserRole, DocumentPermission } from '@/types';

// Firestore Database Operations

// User Management
export const userService = {
  // Create user document
  async createUser(userData: Omit<User, 'uid'>): Promise<string> {
    const userRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return userRef.id;
  },

  // Get user by ID
  async getUserById(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role,
        department: data.department,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        lastLoginAt: data.lastLoginAt?.toDate(),
        isActive: data.isActive,
      };
    }
    return null;
  },

  // Get all users with pagination
  async getUsers(pageSize: number = 20, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    let q = query(
      collection(db, COLLECTIONS.USERS),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastLoginAt: doc.data().lastLoginAt?.toDate(),
    })) as User[];

    return {
      users,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize,
    };
  },

  // Update user
  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete user (soft delete)
  async deleteUser(uid: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  },

  // Get users by role
  async getUsersByRole(role: UserRole): Promise<User[]> {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('role', '==', role),
      where('isActive', '==', true),
      orderBy('displayName')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastLoginAt: doc.data().lastLoginAt?.toDate(),
    })) as User[];
  },

  // Get users by department
  async getUsersByDepartment(department: string): Promise<User[]> {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('department', '==', department),
      where('isActive', '==', true),
      orderBy('displayName')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastLoginAt: doc.data().lastLoginAt?.toDate(),
    })) as User[];
  },
};

// Document Management
export const documentService = {
  // Create document
  async createDocument(documentData: Omit<Document, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.DOCUMENTS), {
      ...documentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastAccessedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Get document by ID
  async getDocumentById(id: string): Promise<Document | null> {
    const docSnapshot = await getDoc(doc(db, COLLECTIONS.DOCUMENTS, id));
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        lastAccessedAt: data.lastAccessedAt?.toDate(),
      } as Document;
    }
    return null;
  },

  // Get documents for user
  async getDocumentsForUser(userId: string, pageSize: number = 20): Promise<Document[]> {
    const q = query(
      collection(db, COLLECTIONS.DOCUMENTS),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(pageSize)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastAccessedAt: doc.data().lastAccessedAt?.toDate(),
    })) as Document[];
  },

  // Get shared documents for user
  async getSharedDocumentsForUser(userId: string): Promise<Document[]> {
    const q = query(
      collection(db, COLLECTIONS.DOCUMENTS),
      where('sharedWith', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastAccessedAt: doc.data().lastAccessedAt?.toDate(),
    })) as Document[];
  },

  // Update document
  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.DOCUMENTS, id), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete document
  async deleteDocument(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.DOCUMENTS, id));
  },

  // Update last accessed time
  async updateLastAccessed(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.DOCUMENTS, id), {
      lastAccessedAt: Timestamp.now(),
    });
  },

  // Search documents
  async searchDocuments(searchTerm: string, userId: string): Promise<Document[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia or similar for production
    const q = query(
      collection(db, COLLECTIONS.DOCUMENTS),
      where('ownerId', '==', userId),
      orderBy('name')
    );
    
    const snapshot = await getDocs(q);
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastAccessedAt: doc.data().lastAccessedAt?.toDate(),
    })) as Document[];

    // Client-side filtering (consider server-side solution for production)
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  },
};

// Folder Management
export const folderService = {
  // Create folder
  async createFolder(folderData: Omit<Folder, 'id'>): Promise<string> {
    const folderRef = await addDoc(collection(db, COLLECTIONS.FOLDERS), {
      ...folderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return folderRef.id;
  },

  // Get folder by ID
  async getFolderById(id: string): Promise<Folder | null> {
    const folderDoc = await getDoc(doc(db, COLLECTIONS.FOLDERS, id));
    if (folderDoc.exists()) {
      const data = folderDoc.data();
      return {
        id: folderDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Folder;
    }
    return null;
  },

  // Get folders for user
  async getFoldersForUser(userId: string): Promise<Folder[]> {
    const q = query(
      collection(db, COLLECTIONS.FOLDERS),
      where('ownerId', '==', userId),
      orderBy('name')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Folder[];
  },

  // Get subfolders
  async getSubfolders(parentId: string): Promise<Folder[]> {
    const q = query(
      collection(db, COLLECTIONS.FOLDERS),
      where('parentId', '==', parentId),
      orderBy('name')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Folder[];
  },

  // Update folder
  async updateFolder(id: string, updates: Partial<Folder>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.FOLDERS, id), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete folder
  async deleteFolder(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.FOLDERS, id));
  },
};

// Audit Log Service
export const auditService = {
  async logAction(action: string, userId: string, details: any): Promise<void> {
    await addDoc(collection(db, COLLECTIONS.AUDIT_LOGS), {
      action,
      userId,
      details,
      timestamp: Timestamp.now(),
      ip: 'client-side', // In production, this should come from server
      userAgent: navigator.userAgent,
    });
  },

  async getAuditLogs(userId?: string, limitCount: number = 50) {
    let q = query(
      collection(db, COLLECTIONS.AUDIT_LOGS),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    if (userId) {
      q = query(
        collection(db, COLLECTIONS.AUDIT_LOGS),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    }));
  },
};

// Permission Service
export const permissionService = {
  async grantPermission(documentId: string, userId: string, role: 'viewer' | 'editor', grantedBy: string): Promise<void> {
    const permission: DocumentPermission = {
      userId,
      role,
      grantedAt: new Date(),
      grantedBy,
    };

    // Update document permissions array
    const docRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentPermissions = docSnap.data().permissions || [];
      const existingIndex = currentPermissions.findIndex((p: DocumentPermission) => p.userId === userId);
      
      if (existingIndex >= 0) {
        currentPermissions[existingIndex] = permission;
      } else {
        currentPermissions.push(permission);
      }

      await updateDoc(docRef, {
        permissions: currentPermissions,
        updatedAt: Timestamp.now(),
      });

      // Log the action
      await auditService.logAction('PERMISSION_GRANTED', grantedBy, {
        documentId,
        targetUserId: userId,
        role,
      });
    }
  },

  async revokePermission(documentId: string, userId: string, revokedBy: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentPermissions = docSnap.data().permissions || [];
      const updatedPermissions = currentPermissions.filter((p: DocumentPermission) => p.userId !== userId);

      await updateDoc(docRef, {
        permissions: updatedPermissions,
        updatedAt: Timestamp.now(),
      });

      // Log the action
      await auditService.logAction('PERMISSION_REVOKED', revokedBy, {
        documentId,
        targetUserId: userId,
      });
    }
  },

  async checkPermission(documentId: string, userId: string): Promise<'owner' | 'editor' | 'viewer' | null> {
    const doc = await documentService.getDocumentById(documentId);
    
    if (!doc) return null;
    
    // Check if user is owner
    if (doc.ownerId === userId) return 'owner';
    
    // Check permissions array
    const permission = doc.permissions.find(p => p.userId === userId);
    return permission ? permission.role : null;
  },
};

export default {
  users: userService,
  documents: documentService,
  folders: folderService,
  audit: auditService,
  permissions: permissionService,
};