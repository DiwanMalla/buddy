import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getChannelFiles = query({
  args: {
    roomId: v.id("rooms"),
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room_and_channel", (q) =>
        q.eq("roomId", args.roomId).eq("channelId", args.channelId)
      )
      .collect();

    return messages.filter((m) => m.type === "file" && m.fileId);
  },
});

export const getRoomFiles = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room_and_channel", (q) => q.eq("roomId", args.roomId))
      .collect();

    return messages.filter((m) => m.type === "file" && m.fileId);
  },
});

export const generateUploadUrl = mutation({
  args: {
    roomId: v.optional(v.id("rooms")),
    memberId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.roomId && args.memberId) {
      const member = await ctx.db
        .query("roomMembers")
        .withIndex("by_room_and_member", (q) =>
          q.eq("roomId", args.roomId!).eq("memberId", args.memberId!)
        )
        .unique();
      if (!member)
        throw new Error("You must be a room member to upload files");
    } else {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  },
});
