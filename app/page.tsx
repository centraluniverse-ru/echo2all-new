"use client"
import { sendMessageToTelegram } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useActionState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MessageForm() {
  const [state, action, pending] = useActionState(sendMessageToTelegram, undefined)

  return (
    <>
      <div className="w-screen h-screen overflow-hidden flex justify-center items-center">
        <Card className="w-full max-w-md mx-auto p-4">
          <CardContent>
            <form action={action} className="space-y-4">
              {state !== undefined &&
                (
                  <Alert variant={state.ok ? "default" : "destructive"}>
                    <AlertTitle>
                      Сообщение {state.ok ? "отправлено успешно" : "не отправлено"}
                    </AlertTitle>
                    <AlertDescription>
                      {state.message}
                    </AlertDescription>
                  </Alert>
                )}
              <Textarea
                placeholder="Your message"
                name="message"
                required
              />
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
