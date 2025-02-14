import { Telegraf, Context as TelegrafContext } from "telegraf";

import { message } from "telegraf/filters";
import { Message } from "telegraf/types";
import { type NextRequest } from "next/server";

const bot = new Telegraf<TelegrafContext>(process.env.BOT_TOKEN as string);


const CHAT_ID = process.env.CHAT_ID as string;



bot.on(message(), async (ctx: TelegrafContext) => {
  if (ctx.message) {
    if ("sticker" in ctx.message) {
      await ctx.telegram.copyMessage(
        CHAT_ID,
        ctx.message.chat.id,
        ctx.message.message_id
      );
    } else if ("voice" in ctx.message) {
      const sentMessage = await ctx.telegram.copyMessage(
        CHAT_ID,
        ctx.message.chat.id,
        ctx.message.message_id
      );
      await ctx.telegram.editMessageCaption(
        CHAT_ID,
        sentMessage.message_id,
        undefined,
        `cue2a_${sentMessage.message_id}\n${ctx.message.caption || ""}`
      );
    } else if ("video_note" in ctx.message) {
      await ctx.telegram.copyMessage(
        CHAT_ID,
        ctx.message.chat.id,
        ctx.message.message_id
      );
    } else if ("media_group" in ctx) {
      console.log("MEDIA_GROUP");
    } else if (
      "photo" in ctx.message ||
      "video" in ctx.message ||
      "document" in ctx.message ||
      "audio" in ctx.message
    ) {
      const message = ctx.message as
        | Message.PhotoMessage
        | Message.VideoMessage
        | Message.DocumentMessage
        | Message.AudioMessage;
      let sentMessage: Message | undefined;

      if ("photo" in message) {
        sentMessage = await ctx.telegram.sendPhoto(
          CHAT_ID,
          message.photo[message.photo.length - 1].file_id,
          {
            caption: message.caption,
          }
        );
      } else if ("video" in message) {
        sentMessage = await ctx.telegram.sendVideo(
          CHAT_ID,
          message.video.file_id,
          {
            caption: message.caption,
          }
        );
      } else if ("document" in message) {
        sentMessage = await ctx.telegram.sendDocument(
          CHAT_ID,
          message.document.file_id,
          {
            caption: message.caption,
          }
        );
      } else if ("audio" in message) {
        sentMessage = await ctx.telegram.sendAudio(
          CHAT_ID,
          message.audio.file_id,
          {
            caption: message.caption,
          }
        );
      }
      if (sentMessage && "message_id" in sentMessage) {
        const newCaption = `cue2a_${sentMessage.message_id}\n${
          message.caption || ""
        }`;
        await ctx.telegram.editMessageCaption(
          CHAT_ID,
          sentMessage.message_id,
          undefined,
          newCaption
        );
      }
    } else {
      const sentMessage = await ctx.telegram.copyMessage(
        CHAT_ID,
        ctx.message.chat.id,
        ctx.message.message_id
      );
      await ctx.telegram.editMessageText(
        CHAT_ID,
        sentMessage.message_id,
        undefined,
        `cue2a_${sentMessage.message_id}\n${
          (ctx.message as Message.TextMessage).text ?? ""
        }`
      );
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    await bot.handleUpdate(await req.json());
  } catch (error) {
    console.error("Error handling update:", error);
  }
  return new Response("OK", { status: 200 });
}
