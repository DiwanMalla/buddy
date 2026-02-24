import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createChannel = mutation({
  args: {
    roomId: v.id("rooms"),
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("channels", {
      roomId: args.roomId,
      name: args.name,
      description: args.description,
      createdBy: args.createdBy,
    });
  },
});

export const getChannels = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("channels")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const getChannel = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.channelId);
  },
});

export const deleteChannel = mutation({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel not found");
    if (channel.name === "general")
      throw new Error("Cannot delete the general channel");

    await ctx.db.delete(args.channelId);
  },
});
