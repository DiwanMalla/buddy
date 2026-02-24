import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    channelId: v.optional(v.id("channels")),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("file")),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    senderId: v.string(),
    senderName: v.string(),
    senderImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      roomId: args.roomId,
      channelId: args.channelId,
      senderId: args.senderId,
      senderName: args.senderName,
      senderImage: args.senderImage,
      content: args.content,
      type: args.type,
      fileId: args.fileId,
      fileName: args.fileName,
    });
  },
});

export const getMessages = query({
  args: {
    roomId: v.id("rooms"),
    channelId: v.optional(v.id("channels")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_room_and_channel", (q) => {
        const q1 = q.eq("roomId", args.roomId);
        return args.channelId ? q1.eq("channelId", args.channelId) : q1;
      })
      .order("asc")
      .collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  },
});
