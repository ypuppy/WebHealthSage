import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { urlSchema, insertReportSchema } from "@shared/schema";
import { analyzeWebsite } from "./lib/analyzer";
import { z } from "zod";

export async function registerRoutes(app: Express) {
  app.post("/api/analyze", async (req, res) => {
    try {
      const { url } = await urlSchema.parseAsync(req.body);
      
      // Create website entry
      const website = await storage.createWebsite({ url });
      
      try {
        // Analyze website
        const analysis = await analyzeWebsite(url);
        
        // Create report
        const report = await storage.createReport({
          websiteId: website.id,
          seoScore: analysis.seoScore,
          performanceScore: analysis.performanceScore,
          securityScore: analysis.securityScore,
          accessibilityScore: analysis.accessibilityScore,
          sentimentScore: analysis.sentimentScore,
          details: analysis.details,
        });
        
        // Update website status
        await storage.updateWebsiteStatus(website.id, "completed");
        
        res.json({ websiteId: website.id, reportId: report.id });
      } catch (error) {
        await storage.updateWebsiteStatus(website.id, "failed");
        throw error;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.issues[0].message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.get("/api/website/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const website = await storage.getWebsite(id);
      
      if (!website) {
        return res.status(404).json({ message: "Website not found" });
      }
      
      res.json(website);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/report/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
