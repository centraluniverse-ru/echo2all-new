"use client"
import {sendMessageToTelegram} from "./actions";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent} from "@/components/ui/card";
import {useActionState} from "react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Input} from "@/components/ui/input";
import Script from "next/script";

export default function MessageForm() {
    const sendMessageToTelegramWithCaptcha = async (_: unknown, form: FormData) => {
        try {
            const token = await (window as unknown).grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, {action: 'submit_form'});
            return await sendMessageToTelegram(_, form, token)

        } catch (e) {
            console.error(e);
            return {ok: false, message: "Ошибка при работе с капчей"}
        }
    }
    const [state, action, pending] = useActionState(sendMessageToTelegramWithCaptcha, undefined)

    return (<>
            <Script strategy="beforeInteractive"
                    src="https://www.google.com/recaptcha/api.js?render=6LdSmQMrAAAAAIr67-DJkwpwLAZJ2sd8ajk9y7o3"></Script>
            <div className="w-screen h-screen overflow-hidden flex justify-center items-center">
                <Card className="w-full max-w-md mx-auto p-4">
                    <CardContent>
                        <form action={action} className="space-y-4">
                            {state !== undefined && (<Alert variant={state.ok ? "default" : "destructive"}>
                                <AlertTitle>
                                    Сообщение {state.ok ? "отправлено успешно" : "не отправлено"}
                                </AlertTitle>
                                <AlertDescription>
                                    {state.message}
                                </AlertDescription>
                            </Alert>)}
                            <Textarea
                                placeholder="Your message"
                                name="message"
                            />
                            <Input type="file" name="files" multiple/>
                            <Button disabled={pending} type="submit" className="w-full">
                                Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>

    );
}
