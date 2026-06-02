import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SITE_DESCRIPTION, SITE_NAME } from "@/config/site";

interface ChannelLandingProps {
  channelName: string;
  errorMessage: string;
  isConnecting: boolean;
  onChannelNameChange: (value: string) => void;
  onSubmit: () => void;
}

const LANDING_FEATURES = [
  "Collect entrants automatically from Kick live chat",
  "Draw winners with a wheel picker or slot-style animation",
  "Support multiple winners and optional confirmation countdown",
  "Runs in the browser — no signup or install required",
] as const;

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
    <article className="mx-auto w-full max-w-xl">
      <header className="mb-6 space-y-3 text-center">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Free Kick.com giveaway tool
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {SITE_NAME}
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          {SITE_DESCRIPTION}
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Connect your Kick channel</h2>
          <p className="text-sm text-muted-foreground">
            Enter the channel slug to start a live chat giveaway
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <label htmlFor="kick-channel" className="sr-only">
              Kick channel name
            </label>
            <Input
              id="kick-channel"
              name="channel"
              autoComplete="off"
              size={"2xl"}
              spellCheck={false}
              value={channelName}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChannelNameChange(event.target.value)
              }
              placeholder="channel name, e.g. xqc"
              aria-label="Kick channel name"
            />
            <Button
              type="submit"
              size="2xl"
              variant="kick"
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

      <section
        className="mt-8 space-y-3"
        aria-labelledby="landing-features-heading"
      >
        <h2
          id="landing-features-heading"
          className="text-center text-sm font-semibold text-foreground"
        >
          Why streamers use kickaway.win
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {LANDING_FEATURES.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span aria-hidden="true" className="text-primary">
                •
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-8 text-center text-xs text-muted-foreground">
        <p>
          Not affiliated with Kick.com. For entertainment giveaways on your
          stream.
        </p>
      </footer>
    </article>
  );
};
