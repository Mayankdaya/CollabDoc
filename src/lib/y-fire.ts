
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
  updateDoc,
} from 'firebase/firestore';
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from 'y-protocols/awareness';
import { db } from './firebase';


export class YFireProvider {
  public awareness: Awareness;
  private readonly doc: Y.Doc;
  private readonly collection: DocumentReference;
  private readonly prefix = 'yfire';
  private readonly unsubscribes: (() => void)[] = [];
  private readonly awarenessDocRef: DocumentReference;
  private readonly updatesDocRef: DocumentReference;

  constructor(docRef: DocumentReference, ydoc: Y.Doc) {
    this.doc = ydoc;
    this.collection = docRef;
    this.awareness = new Awareness(ydoc);
    this.awarenessDocRef = doc(
      db,
      this.collection.path,
      this.prefix,
      'awareness'
    );
    this.updatesDocRef = doc(
      db,
      this.collection.path,
      this.prefix,
      'updates'
    );

    this.setup();
  }

  private async setup() {
    await this.loadInitialData();

    // Subscribe to document updates
    const unsubscribeDoc = onSnapshot(this.updatesDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteUpdate = snapshot.data()?.['data'];
        if (remoteUpdate && Array.isArray(remoteUpdate)) {
            Y.applyUpdate(this.doc, new Uint8Array(remoteUpdate), 'firestore');
        } else if (remoteUpdate instanceof Uint8Array) {
            Y.applyUpdate(this.doc, remoteUpdate, 'firestore');
        }
      }
    });
    this.unsubscribes.push(unsubscribeDoc);

    // Subscribe to awareness changes
    const unsubscribeAwareness = onSnapshot(this.awarenessDocRef, (snapshot) => {
        const data = snapshot.data() || {};
        const remoteStates = new Map<number, any>();
        for (const key in data) {
            remoteStates.set(parseInt(key, 10), data[key]);
        }
        
        const localClientIDs = Array.from(this.awareness.getStates().keys());
        const remoteClientIDs = Array.from(remoteStates.keys());

        const removedClients = localClientIDs.filter(clientID => !remoteClientIDs.includes(clientID) && clientID !== this.doc.clientID);
        const updatedClients = remoteClientIDs.filter(clientID => clientID !== this.doc.clientID);

        if (removedClients.length > 0) {
            removeAwarenessStates(this.awareness, removedClients, 'firestore');
        }

        if (updatedClients.length > 0) {
            const tempAwareness = new Awareness(new Y.Doc());
            updatedClients.forEach(clientID => {
                const state = remoteStates.get(clientID);
                if (state) {
                    tempAwareness.setLocalState(clientID, state);
                }
            });

            if (tempAwareness.getStates().size > 0) {
                // Filter out client IDs that don't have states in tempAwareness
                const validClients = updatedClients.filter(clientId => 
                    tempAwareness.getStates().has(clientId)
                );
                
                // Only proceed if we have valid clients
                if (validClients.length > 0) {
                    const update = encodeAwarenessUpdate(tempAwareness, validClients);
                    applyAwarenessUpdate(this.awareness, update, 'firestore');
                }
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
      await setDoc(this.awarenessDocRef, {
          [String(this.doc.clientID)]: deleteField()
      }, { merge: true });
  }

  private onDocUpdate(update: Uint8Array, origin: any) {
    if (origin !== 'firestore') {
      setDoc(this.updatesDocRef, { data: Array.from(update) }, { merge: true });
    }
  }

  private onAwarenessUpdate(
    {
      added,
      updated,
      removed,
    }: { added: number[]; updated: number[]; removed: number[] },
    origin: any
  ) {
    if (origin === 'firestore') {
      return;
    }

    const changedClients = added.concat(updated);
    const awarenessUpdate: { [key: string]: any } = {};

    changedClients.forEach((clientID) => {
        const state = this.awareness.getStates().get(clientID);
        if (state) {
            awarenessUpdate[String(clientID)] = state;
        }
    });

    removed.forEach((clientID) => {
      awarenessUpdate[String(clientID)] = deleteField();
    });

    if (Object.keys(awarenessUpdate).length > 0) {
      setDoc(this.awarenessDocRef, awarenessUpdate, { merge: true });
    }
  }

  private async loadInitialData() {
    // Load Yjs document data
    const updatesSnapshot = await getDoc(this.updatesDocRef);
    if (updatesSnapshot.exists()) {
      const remoteUpdate = updatesSnapshot.data()?.['data'];
       if (remoteUpdate && Array.isArray(remoteUpdate)) {
            Y.applyUpdate(this.doc, new Uint8Array(remoteUpdate), 'firestore');
        } else if (remoteUpdate instanceof Uint8Array) {
            Y.applyUpdate(this.doc, remoteUpdate, 'firestore');
        }
    }

    // Load and apply awareness states
    const awarenessSnapshot = await getDoc(this.awarenessDocRef);
    if (awarenessSnapshot.exists()) {
      const data = awarenessSnapshot.data();
      if (data) {
        const clients = Object.keys(data).map(Number);
        const awarenessUpdate = new Awareness(new Y.Doc());
        clients.forEach(clientID => {
          awarenessUpdate.setLocalState(clientID, data[clientID]);
        });
        const update = encodeAwarenessUpdate(awarenessUpdate, clients);
        applyAwarenessUpdate(this.awareness, update, 'firestore');
      }
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
