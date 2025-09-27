import { Bot, session } from "grammy";
import env from "../env";
import { conversations, createConversation } from "@grammyjs/conversations";
import { SearchConversation } from "./conversations/search";
import type { MyContext, SearchResult } from "./utils/types";
import { COMMANDS } from "./utils/commands";
import { search } from "./jellyseerr";
import type { InlineQueryResultArticle } from "grammy/types";
import { createTemplate } from "./utils/createTemplate";
import { inlineQueryHandler } from "./utils/inlineQueryHandler";
import { logger } from "./utils/logger";

const { BOT_TOKEN } = env;

const bot = new Bot<MyContext>(BOT_TOKEN);

bot.inlineQuery(/.*/, inlineQueryHandler);

// Install the session plugin.
bot.use(
  session({
    initial() {
      // return empty object for now
      return {};
    },
  })
);

// Install the conversations plugin.
bot.use(conversations());

bot.command(["start"], async (ctx: MyContext) => {
  logger.telegram("Start command received", { userId: ctx.from?.id });
  await ctx.reply("Hello!");
  await ctx.api.setMyCommands(COMMANDS);
});

bot.use(createConversation(SearchConversation.run, "searchConversation"));

bot.command("search", async (ctx: MyContext) => {
  logger.telegram("Search command received", { 
    userId: ctx.from?.id, 
    query: ctx.match 
  });
  await ctx.conversation.exit();
  await ctx.conversation.enter("searchConversation");
});

bot.start({
  onStart: (info: any) => {
    console.log("🤖 Bot started as https://t.me/" + info.username);
    logger.logEnvironment(env);
    logger.info('BOT', 'Teleseerr bot started successfully', {
      username: info.username,
      botId: info.id
    });
  }
});

bot.catch(({ ctx, error }: { ctx: MyContext; error: any }) => {
  console.error("🚨 [Bot Error] Unhandled error occurred:");
  console.error("📍 [Bot Error] Context:", {
    chatId: ctx.chatId,
    userId: ctx.from?.id,
    messageId: ctx.message?.message_id,
    updateType: ctx.update ? Object.keys(ctx.update)[0] : 'unknown'
  });
  console.error("💥 [Bot Error] Error details:", error);
  console.error("🔍 [Bot Error] Error stack:", error.stack);
  
  // Try to send a user-friendly error message
  try {
    ctx.reply("❌ Something went wrong. Please try again or contact support if the issue persists.");
  } catch (replyError) {
    console.error("💔 [Bot Error] Could not send error message to user:", replyError);
  }
});
