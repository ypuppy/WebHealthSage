import { UrlForm } from "@/components/url-form";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="text-center mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Website Analysis Tool
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Get instant insights about your website's SEO, performance, security,
          accessibility, and content sentiment with our AI-powered analysis.
        </p>
      </div>
      <UrlForm />
    </div>
  );
}
