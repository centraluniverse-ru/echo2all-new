import {Context as TelegrafContext, Telegraf} from "telegraf";

import {message} from "telegraf/filters";
import {type NextRequest} from "next/server";

const bot = new Telegraf<TelegrafContext>(process.env.BOT_TOKEN as string);
const CHAT_ID = process.env.CHAT_ID as string;

bot.on("message", async (ctx: TelegrafContext) => {
    if (ctx.message) {
        if (ctx.has(message("poll"))) {
            await ctx.copyMessage(CHAT_ID);
        }
        if (ctx.has(message("sticker"))) {
            await ctx.copyMessage(CHAT_ID);
        }
        if (ctx.has(message("voice"))) {
            const sentMessage = await ctx.copyMessage(CHAT_ID);
            await ctx.telegram.editMessageCaption(CHAT_ID, sentMessage.message_id, undefined, `cue2a_${sentMessage.message_id}\n${ctx.message.caption || ""}`);
        }
        if (ctx.has(message("animation"))) {
            const sentMessage = await ctx.copyMessage(CHAT_ID);
            await ctx.telegram.editMessageCaption(CHAT_ID, sentMessage.message_id, undefined, `cue2a_${sentMessage.message_id}\n${ctx.message.caption || ""}`);
        }
        if (ctx.has(message("document"))) {
            const sentMessage = await ctx.copyMessage(CHAT_ID);
            await ctx.telegram.editMessageCaption(CHAT_ID, sentMessage.message_id, undefined, `cue2a_${sentMessage.message_id}\n${ctx.message.caption || ""}`);
        }
        if (ctx.has(message("video_note"))) {
            await ctx.copyMessage(CHAT_ID);
        }
        if (ctx.has(message("photo"))) {
            const sentMessage = await ctx.copyMessage(CHAT_ID);
            await ctx.telegram.editMessageCaption(CHAT_ID, sentMessage.message_id, undefined, `cue2a_${sentMessage.message_id}\n${ctx.message.caption || ""}`);
        }
        if (ctx.has(message("video"))) {
            const sentMessage = await ctx.copyMessage(CHAT_ID);
            await ctx.telegram.editMessageCaption(CHAT_ID, sentMessage.message_id, undefined, `cue2a_${sentMessage.message_id}\n${ctx.message.caption || ""}`);
        }
        if (ctx.has(message("text"))) {
            if (ctx.text == "/start") {
                await ctx.reply("Я отправлю твое сообщение в @cue2a")
                return
            }
            const sentMessage = await ctx.telegram.copyMessage(CHAT_ID, ctx.message.chat.id, ctx.message.message_id);
            const id_text = `cue2a_${sentMessage.message_id}\n`;
            ctx.message.entities?.forEach(ent => ent.offset = ent.offset + id_text.length);
            await ctx.telegram.editMessageText(CHAT_ID, sentMessage.message_id, undefined, `${id_text}${(ctx.message as Message.TextMessage).text ?? ""}`, {
                entities: ctx.message.entities,
            });
        }
        await ctx.reply("@cue2a")
    }
});

export async function POST(req: NextRequest) {
    try {
        await bot.handleUpdate(await req.json());
    } catch (error) {
        console.error("Error handling update:", error);
    }
    return new Response("OK", {status: 200});
}
