import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import { User, UserRole } from '@/types';

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
  async getUsers(
    pageSize: number = 20,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ) {
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

// Audit Log Service
export const auditService = {
  async logAction(
    action: string,
    userId: string,
    details: Record<string, unknown>
  ): Promise<void> {
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

const firestoreServices = {
  users: userService,
  audit: auditService,
};

export default firestoreServices;
