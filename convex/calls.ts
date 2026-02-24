import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const initiateCall = mutation({
  args: {
    roomId: v.id("rooms"),
    callerId: v.string(),
    callerName: v.string(),
    receiverId: v.string(),
    type: v.union(v.literal("audio"), v.literal("video")),
    offer: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("calls", {
      roomId: args.roomId,
      callerId: args.callerId,
      callerName: args.callerName,
      receiverId: args.receiverId,
      type: args.type,
      status: "ringing",
      offer: args.offer,
    });
  },
});

export const answerCall = mutation({
  args: {
    callId: v.id("calls"),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.callId, {
      status: "accepted",
      answer: args.answer,
    });
  },
});

export const endCall = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.callId, { status: "ended" });
  },
});

export const rejectCall = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.callId, { status: "rejected" });
  },
});

export const addIceCandidate = mutation({
  args: {
    callId: v.id("calls"),
    fromId: v.string(),
    candidate: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("iceCandidates", {
      callId: args.callId,
      fromId: args.fromId,
      candidate: args.candidate,
    });
  },
});

export const getIceCandidates = query({
  args: {
    callId: v.id("calls"),
    excludeFromId: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("iceCandidates")
      .withIndex("by_call", (q) => q.eq("callId", args.callId))
      .collect();
    return all.filter((c) => c.fromId !== args.excludeFromId);
  },
});

export const getCall = query({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.callId);
  },
});

export const getIncomingCall = query({
  args: {
    receiverId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calls")
      .withIndex("by_receiver", (q) =>
        q.eq("receiverId", args.receiverId).eq("status", "ringing")
      )
      .first();
  },
});

export const getActiveCall = query({
  args: {
    memberId: v.string(),
  },
  handler: async (ctx, args) => {
    const asReceiver = await ctx.db
      .query("calls")
      .withIndex("by_receiver", (q) =>
        q.eq("receiverId", args.memberId).eq("status", "accepted")
      )
      .first();
    if (asReceiver) return asReceiver;

    const asCaller = await ctx.db
      .query("calls")
      .withIndex("by_caller", (q) =>
        q.eq("callerId", args.memberId).eq("status", "accepted")
      )
      .first();
    return asCaller;
  },
});
