import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SITE_NAME } from "@/config/site";

const NotFoundPage = () => {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center p-4 md:p-8"
    >
      <article className="mx-auto w-full max-w-xl">
        <header className="mb-6 space-y-3 text-center">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            Page not found
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {SITE_NAME}
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            This page doesn&apos;t exist or may have been moved.
          </p>
        </header>

        <Card>
          <CardHeader className="items-center text-center">
            <p
              aria-hidden="true"
              className="text-6xl font-bold tracking-tight text-kick md:text-7xl"
            >
              404
            </p>
            <h2 className="text-lg font-semibold">Nothing here to giveaway</h2>
            <p className="text-sm text-muted-foreground">
              Double-check the URL or head back to start a live chat giveaway.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              render={<Link href="/" />}
              size="2xl"
              variant="kick"
              className="w-full"
              aria-label="Go back to kickaway.win home"
            >
              Back to home
            </Button>
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Not affiliated with Kick.com. For entertainment giveaways on your
            stream.
          </p>
        </footer>
      </article>
    </main>
  );
};

export default NotFoundPage;
