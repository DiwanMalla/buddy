import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const createRoom = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    clerkOrgId: v.string(),
    passwordHash: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const inviteCode = generateInviteCode();

    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      description: args.description,
      clerkOrgId: args.clerkOrgId,
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

    return { roomId, inviteCode };
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

export const getRoomByOrgId = query({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_clerk_org_id", (q) =>
        q.eq("clerkOrgId", args.clerkOrgId)
      )
      .unique();
  },
});

export const getUserRooms = query({
  args: { orgIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const rooms = [];
    for (const orgId of args.orgIds) {
      const room = await ctx.db
        .query("rooms")
        .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", orgId))
        .unique();
      if (room) rooms.push(room);
    }
    return rooms;
  },
});
