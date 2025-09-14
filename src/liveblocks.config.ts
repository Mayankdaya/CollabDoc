
import { createClient, LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: "pk_dev_W4eVr8avX7cJ_dC1Q1XKAhfY_2qiTOjSHCRgaeovMLrjAB0aHCDuoVZ_AETFGgik",
});

// Presence represents the properties that are descriptive of a user at a particular moment in time.
// This may include things like cursor position, avatar, etc.
type Presence = {
  // cursor: { x: number, y: number } | null,
  // ...
};

// Optionally, Storage represents the shared document that persists in the Room,
// even after all users leave. Fields under Storage typically are LiveList, LiveMap, LiveObject.
// type Storage = {
//   // author: LiveObject<{ firstName: string, lastName: string }>,
//   // ...
// };

// Optionally, UserMeta represents static/readonly metadata on each user, as
// provided by your own custom auth back end (if used). Useful for data that
// will not change during a session, like a user's name or avatar.
// type UserMeta = {
//   id: string,  // Accessible through `user.id`
//   info: {      // Accessible through `user.info`
//     name: string,
//     color: string,
//     picture: string,
//   }
// };

// Optionally, the type of custom events broadcast and listened to in this
// room.
// type RoomEvent = {
//   // type: "reaction",
//   // ...
// };

// Optionally, when using Comments, ThreadMetadata represents metadata on
// each thread. Can only contain booleans, numbers, and strings.
export type ThreadMetadata = {
  // resolved: boolean;
  // quote: string;
  // time: number;
};

export const {
  suspense: {
    RoomProvider: RoomProviderWithSuspense,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    useThreads,
    useCreateThread,
    useEditThreadMetadata,
    useAddReaction,
    useRemoveReaction,
  }
} = createRoomContext<Presence, any, any, any, ThreadMetadata>(client);

export { LiveblocksProvider, RoomProvider, ClientSideSuspense };
