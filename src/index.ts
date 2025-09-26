import { Bot, InlineKeyboard, session } from "grammy";
import env from "../env";
import type { MyContext } from "./utils/types";
import { COMMANDS } from "./utils/commands";
import { createTemplate } from "./utils/createTemplate";
import {
  createRequest,
  getMovieDetails,
  getTvDetails,
  searchJellyseerr,
} from "./utils/jellyseerr";

const { BOT_TOKEN } = env;

const bot = new Bot<MyContext>(BOT_TOKEN);

bot.inlineQuery(/.*/, () => {});

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

bot.command(["start"], async (ctx) => {
  await ctx.reply("Hello!");
  await ctx.api.setMyCommands(COMMANDS);
});

bot.command("search", async (ctx) => {
  const messageText = ctx.message?.text ?? "";
  const query = messageText.replace(/^\/\w+\s*/, "").trim();

  if (!query) {
    await ctx.reply("Please provide a search query. Example: /search dune");
    return;
  }

  try {
    const results = await searchJellyseerr(query);

    if (!results.length) {
      await ctx.reply(`No results found for "${query}".`);
      return;
    }

    const firstResult = results[0];
    const mediaType = firstResult.mediaType;
    const mediaId = firstResult.id;

    if (!mediaType || !mediaId) {
      await ctx.reply("Unable to process the search result.");
      return;
    }

    if (mediaType === "tv") {
      const details = await getTvDetails(mediaId);
      const seasons = (details.seasons ?? [])
        .map((season) => season.seasonNumber)
        .filter((seasonNumber): seasonNumber is number =>
          typeof seasonNumber === "number"
        );

      const keyboard = new InlineKeyboard().text(
        "Request",
        [
          "request",
          mediaType,
          mediaId,
          seasons.join("-"),
        ].join(":"),
      );

      const caption = createTemplate({
        title: details.name ?? firstResult.name ?? "Unknown title",
        overview: details.overview ?? firstResult.overview ?? "",
        releaseDate: details.firstAirDate ?? "Unknown release date",
        mediaType,
      });

      const posterPath = details.posterPath ?? firstResult.posterPath;
      const photoUrl = posterPath
        ? `https://image.tmdb.org/t/p/original${posterPath}`
        : undefined;

      if (photoUrl) {
        await ctx.replyWithPhoto(photoUrl, {
          caption,
          reply_markup: keyboard,
        });
      } else {
        await ctx.reply(caption, {
          reply_markup: keyboard,
        });
      }
    } else {
      const details = await getMovieDetails(mediaId);

      const keyboard = new InlineKeyboard().text(
        "Request",
        ["request", mediaType, mediaId].join(":"),
      );

      const caption = createTemplate({
        title:
          details.title ?? firstResult.title ?? firstResult.name ?? "Unknown title",
        overview: details.overview ?? firstResult.overview ?? "",
        releaseDate: details.releaseDate ?? "Unknown release date",
        mediaType,
      });

      const posterPath = details.posterPath ?? firstResult.posterPath;
      const photoUrl = posterPath
        ? `https://image.tmdb.org/t/p/original${posterPath}`
        : undefined;

      if (photoUrl) {
        await ctx.replyWithPhoto(photoUrl, {
          caption,
          reply_markup: keyboard,
        });
      } else {
        await ctx.reply(caption, {
          reply_markup: keyboard,
        });
      }
    }
  } catch (error) {
    console.error(error);
    await ctx.reply("Search failed. Please try again later.");
  }
});

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery?.data;

  if (!data) {
    await ctx.answerCallbackQuery();
    return;
  }

  const [action, mediaType, id, seasons = ""] = data.split(":");

  if (action !== "request" || (mediaType !== "tv" && mediaType !== "movie")) {
    await ctx.answerCallbackQuery();
    return;
  }

  const mediaId = Number(id);

  if (Number.isNaN(mediaId)) {
    await ctx.answerCallbackQuery({ text: "Invalid media identifier" });
    return;
  }

  const seasonNumbers = seasons
    .split("-")
    .map((season) => Number(season))
    .filter((season) => Number.isFinite(season) && season >= 0);

  try {
    await createRequest({
      mediaType,
      mediaId,
      tvdbId: mediaId,
      seasons: seasonNumbers,
    });

    await ctx.answerCallbackQuery({ text: "Request submitted" });
    await ctx.reply("Your request has been sent to Jellyseerr.");
  } catch (error) {
    console.error(error);
    await ctx.answerCallbackQuery({ text: "Request failed" });
    await ctx.reply("Unable to submit the request. Please try again later.");
  }
});

bot.start({
  onStart: (info) =>
    console.log("Bot started as https://t.me/" + info.username),
});

bot.catch(({ ctx, message }) => {
  console.error(message);

  ctx.reply("Something went wrong.");
});
