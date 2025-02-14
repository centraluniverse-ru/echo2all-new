"use server";
import { Telegraf } from "telegraf";
import {
  InputMediaDocument,
  InputMediaPhoto,
  InputMediaVideo,
} from "telegraf/types";

export async function sendMessageToTelegram(_: unknown, form?: FormData) {
  if (!form) {
    return { ok: false, message: "Форма не передана на бэкенд." };
  }

  let message = form.get("message")?.toString();
  const files = form.getAll("files") as unknown as File[];

  if (!message && !files)
    return {
      ok: false,
      message: "Сообщение пустое или произошла внутренняя ошибка",
    };

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = parseInt(process.env.CHAT_ID ?? "0");

  if (!BOT_TOKEN || !CHAT_ID) {
    return { ok: false, message: "Произошла внутренняя ошибка" };
  }

  let reply_id = undefined;

  if (message) {
    if (message.startsWith("cue2a_")) {
      try {
        reply_id = parseInt(message.split(" ", 1)[0].replace("cue2a_", ""));
        message = message.replace(`cue2a_${reply_id}`, "");
      } catch (e) {
        console.log("Error while parsing reply_id");
        console.error(e);
      }
    }
  }

  const tg = new Telegraf(BOT_TOKEN);

  if (files[0].size > 0) {
    const mediagroup = [];

    const allImagesOrVideos = files.every(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    const allAudios = files.every((file) => file.type.startsWith("audio/"));

    if (allImagesOrVideos) {
      for (const file of files) {
        mediagroup.push({
          type: file.type.split("/")[0] == "image" ? "photo" : "video",
          media: {
            source: Buffer.from(await file.arrayBuffer()),
            filename: file.name,
          },
          caption: message,
        });
      }
    } else if (allAudios) {
      for (const file of files) {
        mediagroup.push({
          type: file.type.split("/")[0],
          media: {
            source: Buffer.from(await file.arrayBuffer()),
            filename: file.name,
          },
          caption: message,
        });
      }
    } else {
      for (const file of files) {
        mediagroup.push({
          type: "document",
          media: {
            source: Buffer.from(await file.arrayBuffer()),
            filename: file.name,
          },
          caption: message,
        });
      }
    }
    const sentMessage = await tg.telegram.sendMediaGroup(
      CHAT_ID,
      mediagroup as
        | (InputMediaPhoto | InputMediaVideo)[]
        | InputMediaVideo[]
        | InputMediaDocument[],
      { reply_parameters: reply_id ? { message_id: reply_id } : undefined }
    );
    await tg.telegram.editMessageCaption(
      sentMessage[0].chat.id,
      sentMessage[0].message_id,
      undefined,
      `cue2a_${sentMessage[0].message_id}\n${sentMessage[0].caption ?? ""}`
    );
    return { ok: true, message: "success" };
  }

  const sentMessage = await tg.telegram.sendMessage(CHAT_ID, message ?? "", {
    reply_parameters: reply_id ? { message_id: reply_id } : undefined,
  });
  if (sentMessage) {
    await tg.telegram.editMessageText(
      CHAT_ID,
      sentMessage.message_id,
      undefined,
      `cue2a_${sentMessage.message_id}\n${sentMessage.text}`
    );
    return { ok: true, message: "Отправлено успешно" };
  }

  return { ok: false, message: "Что-то пошло не так." };
}
