"use server";

import { Telegraf } from "telegraf";

export async function sendMessageToTelegram(_: unknown, form?: FormData) {
  if (!form) {
    return { ok: false, message: "Форма не передана на бэкенд." };
  }
  let message = form.get("message")?.toString();
  let reply_id = undefined;
  if (!message)
    return {
      ok: false,
      message: "Сообщение пустое или произошла внутренняя ошибка",
    };
  if (message.startsWith("cue2a_")) {
    try {
      reply_id = parseInt(message.split(" ", 1)[0].replace("cue2a_", ""));
      message = message.replace(`cue2a_${reply_id}`, "");
    } catch (e) {
      console.log("Error while parsing reply_id");
      console.error(e);
    }
  }
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = parseInt(process.env.CHAT_ID ?? "0");

  if (!BOT_TOKEN || !CHAT_ID) {
    return { ok: false, message: "Произошла внутренняя ошибка" };
  }
  const tg = new Telegraf(BOT_TOKEN);

  const sentMessage = await tg.telegram.sendMessage(CHAT_ID, message, {
    reply_parameters: reply_id ? { message_id: reply_id } : undefined,
  });
  if (sentMessage) {
    tg.telegram.editMessageText(
      CHAT_ID,
      sentMessage.message_id,
      undefined,
      `cue2a_${sentMessage.message_id}\n${sentMessage.text}`
    );
    return { ok: true, message: "Отправлено успешно" };
  }
  return { ok: false, message: "Что-то пошло не так." };
}
