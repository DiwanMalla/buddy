"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

const STORAGE_KEY = "buddy_room_member";

export type RoomMember =
  | { type: "guest"; memberId: string; memberName: string }
  | { type: "clerk"; memberId: string; memberName: string; memberImage?: string };

type StoredGuest = { roomId: string; memberId: string; memberName: string };

type ContextValue = {
  member: RoomMember | null;
  roomId: string | null;
  setGuestMember: (roomId: string, memberId: string, memberName: string) => void;
  setClerkMember: (
    memberId: string,
    memberName: string,
    memberImage?: string
  ) => void;
  clearMember: () => void;
  getMemberForRoom: (roomId: string) => RoomMember | null;
};

const RoomMemberContext = createContext<ContextValue | null>(null);

export function RoomMemberProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<RoomMember | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Record<string, StoredGuest>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, StoredGuest>;
        setGuests(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistGuest = useCallback(
    (rId: string, mId: string, mName: string) => {
      const next = { ...guests, [rId]: { roomId: rId, memberId: mId, memberName: mName } };
      setGuests(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    },
    [guests]
  );

  const setGuestMember = useCallback(
    (rId: string, mId: string, mName: string) => {
      persistGuest(rId, mId, mName);
      setRoomId(rId);
      setMember({ type: "guest", memberId: mId, memberName: mName });
    },
    [persistGuest]
  );

  const setClerkMember = useCallback(
    (mId: string, mName: string, mImage?: string) => {
      setRoomId(null);
      setMember({
        type: "clerk",
        memberId: mId,
        memberName: mName,
        memberImage: mImage,
      });
    },
    []
  );

  const clearMember = useCallback(() => {
    setMember(null);
    setRoomId(null);
  }, []);

  const getMemberForRoom = useCallback(
    (rId: string): RoomMember | null => {
      const guest = guests[rId];
      if (guest) {
        return {
          type: "guest",
          memberId: guest.memberId,
          memberName: guest.memberName,
        };
      }
      return member?.type === "clerk" ? member : null;
    },
    [guests, member]
  );

  return (
    <RoomMemberContext.Provider
      value={{
        member,
        roomId,
        setGuestMember,
        setClerkMember,
        clearMember,
        getMemberForRoom,
      }}
    >
      {children}
    </RoomMemberContext.Provider>
  );
}

export function useRoomMember() {
  const ctx = useContext(RoomMemberContext);
  if (!ctx) throw new Error("useRoomMember must be used within RoomMemberProvider");
  return ctx;
}
