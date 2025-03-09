import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { urlSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function UrlForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: "",
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/analyze", { url });
      return res.json();
    },
    onSuccess: (data) => {
      setLocation(`/dashboard/${data.websiteId}`);
    },
    onError: (error: Error) => {
      const message = error.message.includes('quota') 
        ? "API quota exceeded. Please try again later."
        : error.message;

      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: message,
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => analyzeMutation.mutate(data.url))}
        className="flex gap-2 w-full max-w-lg"
      >
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Enter website URL"
                  {...field}
                  disabled={analyzeMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={analyzeMutation.isPending}>
          {analyzeMutation.isPending ? "Analyzing..." : "Analyze"}
        </Button>
      </form>
    </Form>
  );
}