
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
import { RelativePosition } from 'y-prosemirror';


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
        if (remoteUpdate && remoteUpdate.toUint8Array) {
            Y.applyUpdate(this.doc, remoteUpdate.toUint8Array(), 'firestore');
        } else if (remoteUpdate instanceof Uint8Array) {
            Y.applyUpdate(this.doc, remoteUpdate, 'firestore');
        }
      }
    });
    this.unsubscribes.push(unsubscribeDoc);

    // Subscribe to awareness changes
    const unsubscribeAwareness = onSnapshot(this.awarenessDocRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            if (data) {
                const clients = Object.keys(data).map(Number).filter(id => id !== this.doc.clientID);
                const states = new Map(clients.map(clientID => {
                    const state = data[clientID];
                     if (state.cursor) {
                        // Deserialize the cursor position
                        state.cursor = RelativePosition.fromJSON(state.cursor);
                    }
                    return [clientID, state];
                }));
                
                const tempAwareness = new Awareness(new Y.Doc());
                // Manually set states on the temporary awareness instance
                for (const [clientID, state] of states.entries()) {
                    tempAwareness.setLocalState(clientID, state);
                }

                const updatedClients = Array.from(tempAwareness.getStates().keys());
                
                if(updatedClients.length > 0) {
                    const encodedUpdate = encodeAwarenessUpdate(tempAwareness, updatedClients);
                    applyAwarenessUpdate(this.awareness, encodedUpdate, 'firestore');
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
    if (this.awareness.getLocalState() !== null) {
      const update = {
        [this.doc.clientID]: deleteField(),
      };
      await setDoc(this.awarenessDocRef, update, { merge: true });
    }
  }

  private onDocUpdate(update: Uint8Array, origin: any) {
    if (origin !== 'firestore') {
      setDoc(this.updatesDocRef, { data: update }, { merge: true });
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
        // Serialize cursor position if it exists
        const serializableState = { ...state };
        if (serializableState.cursor) {
          serializableState.cursor = serializableState.cursor.toJSON();
        }
        awarenessUpdate[String(clientID)] = serializableState;
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
       if (remoteUpdate && remoteUpdate.toUint8Array) {
            Y.applyUpdate(this.doc, remoteUpdate.toUint8Array(), 'firestore');
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
        
        // Create a temporary awareness instance to build the update from.
        const tempAwareness = new Awareness(new Y.Doc());
        for (const clientID of clients) {
          const state = data[clientID];
          if (state) {
            if (state.cursor) {
              // Deserialize the cursor position from JSON
              state.cursor = RelativePosition.fromJSON(state.cursor);
            }
            tempAwareness.setLocalState(clientID, state);
          }
        }
        
        const states = tempAwareness.getStates();
        const updatedClients = Array.from(states.keys());
        if (updatedClients.length > 0) {
            const update = encodeAwarenessUpdate(tempAwareness, updatedClients);
            applyAwarenessUpdate(this.awareness, update, 'firestore');
        }
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
