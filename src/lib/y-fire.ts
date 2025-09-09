
import * as Y from 'yjs';
import {
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  writeBatch,
  deleteField,
  updateDoc
} from 'firebase/firestore';
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness';

export class YFireProvider {
  public awareness: Awareness;
  private readonly doc: Y.Doc;
  private readonly collection: DocumentReference;
  private readonly prefix = 'yfire';
  private readonly unsubscribes: (() => void)[] = [];
  private readonly awarenessDocRef: DocumentReference;

  constructor(docRef: DocumentReference, ydoc: Y.Doc) {
    this.doc = ydoc;
    this.collection = docRef;
    this.awareness = new Awareness(ydoc);
    this.awarenessDocRef = doc(this.collection, this.prefix, 'awareness');

    this.setup();
  }

  private async setup() {
    await this.loadInitialData();

    const unsubscribeDoc = onSnapshot(
      this.collection,
      async (snapshot) => {
        if (snapshot.exists() && snapshot.data()?.['doc']) {
          const remoteUpdate = snapshot.data()?.['doc'];
          if (remoteUpdate) {
            Y.applyUpdate(this.doc, remoteUpdate, 'firestore');
          }
        }
      }
    );
    this.unsubscribes.push(unsubscribeDoc);

    const docUpdates = doc(this.collection, this.prefix, 'updates');
    const unsubscribeUpdates = onSnapshot(docUpdates, async (snapshot) => {
      if (snapshot.exists() && snapshot.data()) {
        const update = snapshot.data() as { data: Uint8Array };
        Y.applyUpdate(this.doc, update.data, 'firestore');
      }
    });
    this.unsubscribes.push(unsubscribeUpdates);
    
    // Subscribe to awareness changes
    const unsubscribeAwareness = onSnapshot(this.awarenessDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data) {
          const clients = Object.keys(data).map(Number);
          const update = encodeAwarenessUpdate(this.awareness, clients);
          applyAwarenessUpdate(this.awareness, update, 'firestore');
        }
      }
    });
    this.unsubscribes.push(unsubscribeAwareness);
    
    this.doc.on('update', this.onDocUpdate.bind(this));
    this.awareness.on('update', this.onAwarenessUpdate.bind(this));
    
    this.setupAwarenessUnload();
  }
  
  private setupAwarenessUnload() {
    window.addEventListener('beforeunload', this.onAwarenessUnload.bind(this));
  }
  
  private async onAwarenessUnload() {
      if(this.awareness.getLocalState() !== null) {
          const update = {
              [this.doc.clientID]: deleteField()
          };
          await setDoc(this.awarenessDocRef, update, { merge: true });
      }
  }

  private onDocUpdate(update: Uint8Array, origin: any) {
    if (origin !== 'firestore') {
      const docUpdates = doc(this.collection, this.prefix, 'updates');
      setDoc(docUpdates, { data: update }, { merge: true });
    }
  }
  
  private onAwarenessUpdate({ added, updated, removed }: { added: number[], updated: number[], removed: number[] }, origin: any) {
    if (origin === 'firestore') {
      return;
    }
    
    const changedClients = added.concat(updated);
    const awarenessUpdate: { [key: string]: any } = {};

    changedClients.forEach(clientID => {
      const state = this.awareness.getStates().get(clientID);
      if(state) {
        awarenessUpdate[String(clientID)] = state;
      }
    });
    
    removed.forEach(clientID => {
        awarenessUpdate[String(clientID)] = deleteField();
    });

    if (Object.keys(awarenessUpdate).length > 0) {
      setDoc(this.awarenessDocRef, awarenessUpdate, { merge: true });
    }
  }

  private async loadInitialData() {
    const docSnapshot = await getDoc(this.collection);
    if (docSnapshot.exists() && docSnapshot.data()?.['doc']) {
      const dbDoc = docSnapshot.data()?.['doc'];
      Y.applyUpdate(this.doc, dbDoc);
    }
    
    const awarenessSnapshot = await getDoc(this.awarenessDocRef);
    if (awarenessSnapshot.exists()) {
        const data = awarenessSnapshot.data();
        if (data) {
          const clients = Object.keys(data).map(Number);
          const update = encodeAwarenessUpdate(this.awareness, clients);
          applyAwarenessUpdate(this.awareness, update, 'firestore');
        }
    }

    const docUpdates = doc(this.collection, this.prefix, 'updates');
    const updatesSnapshot = await getDoc(docUpdates);
    if (updatesSnapshot.exists()) {
        const update = updatesSnapshot.data() as { data: Uint8Array };
        Y.applyUpdate(this.doc, update.data);
    }
  }
  
  public destroy() {
    this.onAwarenessUnload();
    window.removeEventListener('beforeunload', this.onAwarenessUnload);
    this.unsubscribes.forEach((unsub) => unsub());
    this.doc.off('update', this.onDocUpdate);
    this.awareness.off('update', this.onAwarenessUpdate);
  }
}
