import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull(),
  seoScore: integer("seo_score").notNull(),
  performanceScore: integer("performance_score").notNull(),
  securityScore: integer("security_score").notNull(),
  accessibilityScore: integer("accessibility_score").notNull(),
  sentimentScore: integer("sentiment_score").notNull(),
  details: jsonb("details").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWebsiteSchema = createInsertSchema(websites).pick({
  url: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export type Website = typeof websites.$inferSelect;
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});
