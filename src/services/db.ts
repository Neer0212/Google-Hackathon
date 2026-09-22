import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, where, Timestamp, addDoc } from 'firebase/firestore';

export interface Translation {
  language: string;
  languageCode: string;
  text: string;
  romanized?: string;
}

export interface Message {
  id?: string;
  classId: string;
  originalText: string;
  detectedLanguage?: string;
  enhancedMessage?: string;
  type: string;
  createdAt: number;
  translations: Translation[];
}

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  createdAt: number;
}

// Memory fallback if Firebase is not configured (for Hackathon MVP P0 without credentials)
const localDb = {
  classes: [] as Classroom[],
  messages: [] as Message[],
};

// Initialize some demo data
localDb.classes.push({
  id: 'class-10a',
  name: 'Class 10A',
  teacherId: 'demo-teacher',
  createdAt: Date.now(),
});

export const dbService = {
  async getClassroom(classId: string): Promise<Classroom | null> {
    if (isFirebaseConfigured() && db) {
      const docRef = doc(db, 'classes', classId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Classroom;
      }
      return null;
    } else {
      return localDb.classes.find((c) => c.id === classId) || null;
    }
  },

  async getMessages(classId: string): Promise<Message[]> {
    if (isFirebaseConfigured() && db) {
      const q = query(
        collection(db, 'messages'),
        where('classId', '==', classId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));
    } else {
      return localDb.messages
        .filter((m) => m.classId === classId)
        .sort((a, b) => b.createdAt - a.createdAt);
    }
  },

  async saveMessage(message: Omit<Message, 'id'>): Promise<string> {
    if (isFirebaseConfigured() && db) {
      const docRef = await addDoc(collection(db, 'messages'), message);
      return docRef.id;
    } else {
      const id = 'msg_' + Math.random().toString(36).substr(2, 9);
      const newMessage = { ...message, id };
      localDb.messages.push(newMessage);
      
      // Update localStorage for persistence across reloads (mocking)
      if (typeof window !== 'undefined') {
         const stored = JSON.parse(localStorage.getItem('mockMessages') || '[]');
         stored.push(newMessage);
         localStorage.setItem('mockMessages', JSON.stringify(stored));
      }
      return id;
    }
  },
  
  loadLocalMockData() {
     if (!isFirebaseConfigured() && typeof window !== 'undefined') {
         const stored = JSON.parse(localStorage.getItem('mockMessages') || '[]');
         localDb.messages = stored;
     }
  }
};
