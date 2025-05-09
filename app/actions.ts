"use server";
import {Telegraf} from "telegraf";
import {InputMediaDocument, InputMediaPhoto, InputMediaVideo,} from "telegraf/types";

export async function sendMessageToTelegram(_: unknown, form: FormData, token: unknown) {
    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
        });
        if (!response.ok) return {ok: false, message: "Ошибка при верификации качи"}
        const data = await response.json()

        if (!data.success || data.score <= 0.5) return {ok: false, message: "Не пройдена проверка капчи"}

    } catch {
        return {ok: false, message: "Ошибка при верификации качи"}
    }

    if (!form) {
        return {ok: false, message: "Форма не передана на бэкенд."};
    }

    let message = form.get("message")?.toString();
    const files = form.getAll("files") as unknown as File[];
    if ((!message || message == "") && (files.length == 1 && files[0].size == 0)) return {
        ok: false, message: "Сообщение пустое.",
    };

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = parseInt(process.env.CHAT_ID ?? "0");

    if (!BOT_TOKEN || !CHAT_ID) {
        return {ok: false, message: "Произошла внутренняя ошибка"};
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

        const allImagesOrVideos = files.every((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
        const allAudios = files.every((file) => file.type.startsWith("audio/"));

        if (allImagesOrVideos) {
            for (const file of files) {
                mediagroup.push({
                    type: file.type.split("/")[0] == "image" ? "photo" : "video", media: {
                        source: Buffer.from(await file.arrayBuffer()), filename: file.name,
                    }, caption: message, parse_mode: "MarkdownV2"
                });
            }
        } else if (allAudios) {
            for (const file of files) {
                mediagroup.push({
                    type: file.type.split("/")[0], media: {
                        source: Buffer.from(await file.arrayBuffer()), filename: file.name,
                    }, caption: message, parse_mode: "MarkdownV2"
                });
            }
        } else {
            for (const file of files) {
                mediagroup.push({
                    type: "document", media: {
                        source: Buffer.from(await file.arrayBuffer()), filename: file.name,
                    }, caption: message, parse_mode: "MarkdownV2"
                });
            }
        }
        try {
            const sentMessage = await tg.telegram.sendMediaGroup(CHAT_ID, mediagroup as | (InputMediaPhoto | InputMediaVideo)[] | InputMediaVideo[] | InputMediaDocument[], {reply_parameters: reply_id ? {message_id: reply_id} : undefined});
            const id_text = `cue2a_${sentMessage[0].message_id}\n`;
            sentMessage[0].caption_entities?.forEach(ent => ent.offset += id_text.length);
            await tg.telegram.editMessageCaption(sentMessage[0].chat.id, sentMessage[0].message_id, undefined, `${id_text}${sentMessage[0].caption ?? ""}`, {
                caption_entities: sentMessage[0].caption_entities
            });
            return {ok: true, message: "success"};
        } catch {
            return {ok: false, message: "Ошибка при отправке сообщения"}
        }

    }

    const sentMessage = await tg.telegram.sendMessage(CHAT_ID, message ?? "", {
        reply_parameters: reply_id ? {message_id: reply_id} : undefined,
        parse_mode: "MarkdownV2"
    });
    if (sentMessage) {
        const id_text = `cue2a_${sentMessage.message_id}\n`;
        sentMessage.entities?.forEach(ent => ent.offset += id_text.length);
        await tg.telegram.editMessageText(CHAT_ID, sentMessage.message_id, undefined, `${id_text}${sentMessage.text}`, {
            entities: sentMessage.entities,
        });
        return {ok: true, message: "Отправлено успешно"};
    }

    return {ok: false, message: "Что-то пошло не так."};
}
