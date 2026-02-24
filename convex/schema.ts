import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  rooms: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    clerkOrgId: v.optional(v.string()),
    passwordHash: v.string(),
    inviteCode: v.string(),
    createdBy: v.string(),
  })
    .index("by_invite_code", ["inviteCode"])
    .index("by_created_by", ["createdBy"]),

  roomMembers: defineTable({
    roomId: v.id("rooms"),
    memberId: v.string(),
    name: v.string(),
    email: v.string(),
    isGuest: v.boolean(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_member", ["roomId", "memberId"])
    .index("by_email", ["email"]),

  messages: defineTable({
    roomId: v.id("rooms"),
    channelId: v.optional(v.id("channels")),
    senderId: v.string(),
    senderName: v.string(),
    senderImage: v.optional(v.string()),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("file")),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
  }).index("by_room_and_channel", ["roomId", "channelId"]),

  directMessages: defineTable({
    roomId: v.id("rooms"),
    senderId: v.string(),
    receiverId: v.string(),
    senderName: v.string(),
    senderImage: v.optional(v.string()),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("file")),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
  })
    .index("by_room_and_participants", ["roomId", "senderId", "receiverId"])
    .index("by_room", ["roomId"]),

  channels: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(),
  }).index("by_room", ["roomId"]),

  calls: defineTable({
    roomId: v.id("rooms"),
    callerId: v.string(),
    callerName: v.string(),
    receiverId: v.string(),
    status: v.union(
      v.literal("ringing"),
      v.literal("accepted"),
      v.literal("ended"),
      v.literal("rejected"),
    ),
    type: v.union(v.literal("audio"), v.literal("video")),
    offer: v.optional(v.string()),
    answer: v.optional(v.string()),
  })
    .index("by_room", ["roomId"])
    .index("by_receiver", ["receiverId", "status"])
    .index("by_caller", ["callerId", "status"]),

  iceCandidates: defineTable({
    callId: v.id("calls"),
    fromId: v.string(),
    candidate: v.string(),
  }).index("by_call", ["callId"]),
});
