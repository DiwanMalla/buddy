import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const eventType = body.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, first_name, last_name, email_addresses, image_url } =
        body.data;
      const email = email_addresses?.[0]?.email_address ?? "";
      const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

      await ctx.runMutation(internal.users.upsertUser, {
        clerkId: id,
        name,
        email,
        imageUrl: image_url ?? undefined,
      });
    }

    if (eventType === "user.deleted") {
      const { id } = body.data;
      if (id) {
        await ctx.runMutation(internal.users.deleteUser, { clerkId: id });
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
