import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateGuestId(): string {
  return "guest_" + crypto.randomUUID();
}

export const createRoom = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    passwordHash: v.string(),
    createdBy: v.string(),
    creatorName: v.string(),
    creatorEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (identity.subject !== args.createdBy)
      throw new Error("Unauthorized");

    const inviteCode = generateInviteCode();

    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      description: args.description,
      passwordHash: args.passwordHash,
      inviteCode,
      createdBy: args.createdBy,
    });

    await ctx.db.insert("channels", {
      roomId,
      name: "general",
      description: "General discussion",
      createdBy: args.createdBy,
    });

    await ctx.db.insert("roomMembers", {
      roomId,
      memberId: args.createdBy,
      name: args.creatorName,
      email: args.creatorEmail,
      isGuest: false,
    });

    return { roomId, inviteCode };
  },
});

export const joinRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const existingByEmail = existing.find(
      (m) => m.email.toLowerCase() === args.email.toLowerCase()
    );
    if (existingByEmail) {
      return {
        roomId: args.roomId,
        memberId: existingByEmail.memberId,
        memberName: existingByEmail.name,
      };
    }

    const identity = await ctx.auth.getUserIdentity();
    const memberId = identity ? identity.subject : generateGuestId();

    const existingById = existing.find((m) => m.memberId === memberId);
    if (existingById) {
      return {
        roomId: args.roomId,
        memberId: existingById.memberId,
        memberName: existingById.name,
      };
    }

    await ctx.db.insert("roomMembers", {
      roomId: args.roomId,
      memberId,
      name: args.name,
      email: args.email,
      isGuest: !identity,
    });

    return {
      roomId: args.roomId,
      memberId,
      memberName: args.name,
    };
  },
});

export const getRoomByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();
  },
});

export const getRoomById = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.roomId);
  },
});

export const getRoomsForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("roomMembers")
      .filter((q) => q.eq(q.field("memberId"), args.userId))
      .collect();

    const rooms = [];
    for (const m of memberships) {
      const room = await ctx.db.get(m.roomId);
      if (room) rooms.push(room);
    }
    return rooms;
  },
});

export const getRoomsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("roomMembers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .collect();

    const rooms = [];
    for (const m of memberships) {
      const room = await ctx.db.get(m.roomId);
      if (room) rooms.push({ ...room!, memberName: m.name, memberId: m.memberId });
    }
    return rooms;
  },
});

export const getRoomMembers = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const verifyRoomMember = query({
  args: { roomId: v.id("rooms"), memberId: v.string() },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_member", (q) =>
        q.eq("roomId", args.roomId).eq("memberId", args.memberId)
      )
      .unique();
    return member ?? null;
  },
});
