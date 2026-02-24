import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const sendDirectMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    receiverId: v.string(),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("file")),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    senderId: v.string(),
    senderName: v.string(),
    senderImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("directMessages", {
      roomId: args.roomId,
      senderId: args.senderId,
      receiverId: args.receiverId,
      senderName: args.senderName,
      senderImage: args.senderImage,
      content: args.content,
      type: args.type,
      fileId: args.fileId,
      fileName: args.fileName,
    });
  },
});

export const getDirectMessages = query({
  args: {
    roomId: v.id("rooms"),
    otherUserId: v.string(),
    myId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const myId =
      args.myId ?? (await ctx.auth.getUserIdentity())?.subject;
    if (!myId) return [];
    const otherId = args.otherUserId;

    const sent = await ctx.db
      .query("directMessages")
      .withIndex("by_room_and_participants", (q) =>
        q
          .eq("roomId", args.roomId)
          .eq("senderId", myId)
          .eq("receiverId", otherId),
      )
      .collect();

    const received = await ctx.db
      .query("directMessages")
      .withIndex("by_room_and_participants", (q) =>
        q
          .eq("roomId", args.roomId)
          .eq("senderId", otherId)
          .eq("receiverId", myId),
      )
      .collect();

    return [...sent, ...received].sort(
      (a, b) => a._creationTime - b._creationTime,
    );
  },
});

export const getRecentDMPartners = query({
  args: {
    roomId: v.id("rooms"),
    memberId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const myId =
      args.memberId ??
      (await ctx.auth.getUserIdentity())?.subject;
    if (!myId) return [];

    const allDMs = await ctx.db
      .query("directMessages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const partnerIds = new Set<string>();
    for (const dm of allDMs) {
      if (dm.senderId === myId) partnerIds.add(dm.receiverId);
      if (dm.receiverId === myId) partnerIds.add(dm.senderId);
    }

    return Array.from(partnerIds);
  },
});
