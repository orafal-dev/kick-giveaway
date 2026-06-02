import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ChannelLandingProps {
  channelName: string;
  errorMessage: string;
  isConnecting: boolean;
  onChannelNameChange: (value: string) => void;
  onSubmit: () => void;
}

export const ChannelLanding = ({
  channelName,
  errorMessage,
  isConnecting,
  onChannelNameChange,
  onSubmit,
}: ChannelLandingProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Card className="mx-auto mt-20 w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl">kickaway.win</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter the Kick channel for the giveaway
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            value={channelName}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChannelNameChange(event.target.value)
            }
            placeholder="channel name, e.g. xqc"
            aria-label="Kick channel name"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isConnecting}
            aria-label="Connect to Kick channel"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
          {errorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
};
