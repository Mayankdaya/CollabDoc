
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
} from 'firebase/firestore';
import { Awareness } from 'y-protocols/awareness';

export class YFireProvider {
  public awareness: Awareness;
  private readonly doc: Y.Doc;
  private readonly collection: DocumentReference;
  private readonly prefix = 'yfire';
  private readonly unsubscribes: (() => void)[] = [];

  constructor(docRef: DocumentReference, ydoc: Y.Doc) {
    this.doc = ydoc;
    this.collection = docRef;
    this.awareness = new Awareness(ydoc);

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
    
    this.doc.on('update', this.onDocUpdate.bind(this));
    this.awareness.on('update', this.onAwarenessUpdate.bind(this));
    
    this.setupAwarenessUnload();
  }
  
  private setupAwarenessUnload() {
    window.addEventListener('beforeunload', this.onAwarenessUnload.bind(this));
  }
  
  private async onAwarenessUnload() {
    const state = this.awareness.getLocalState();
    if(state) {
        const awarenessRef = doc(
            this.collection,
            this.prefix,
            `awareness/${this.doc.clientID}`
        );
        await deleteDoc(awarenessRef);
    }
  }

  private onDocUpdate(update: Uint8Array, origin: any) {
    if (origin !== 'firestore') {
      const docUpdates = doc(this.collection, this.prefix, 'updates');
      setDoc(docUpdates, { data: update }, { merge: true });
    }
  }
  
  private onAwarenessUpdate({ added, updated, removed }: { added: number[], updated: number[], removed: number[] }) {
    const changedClients = added.concat(updated, removed);
    const awarenessRef = doc(this.collection, this.prefix, 'awareness');

    const states = this.awareness.getStates();
    const changes = new Map<number, any>();

    changedClients.forEach(clientID => {
      const state = states.get(clientID);
      changes.set(clientID, state || null);
    });

    const awarenessUpdates = {
      changes: Object.fromEntries(changes.entries())
    };

    setDoc(awarenessRef, awarenessUpdates, { merge: true });
  }

  private async loadInitialData() {
    const docSnapshot = await getDoc(this.collection);
    if (docSnapshot.exists() && docSnapshot.data()?.['doc']) {
      const dbDoc = docSnapshot.data()?.['doc'];
      Y.applyUpdate(this.doc, dbDoc);
    }
    
    const awarenessCollection = collection(this.collection, this.prefix, 'awareness');
    const awarenessSnapshot = await getDocs(awarenessCollection);
    const awarenessStates = new Map();
    awarenessSnapshot.forEach((doc) => {
        awarenessStates.set(parseInt(doc.id), doc.data());
    });
    this.awareness.setStates(awarenessStates, 'firestore');

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
