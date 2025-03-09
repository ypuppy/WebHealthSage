import { Website, InsertWebsite, Report, InsertReport } from "@shared/schema";

export interface IStorage {
  createWebsite(website: InsertWebsite): Promise<Website>;
  getWebsite(id: number): Promise<Website | undefined>;
  updateWebsiteStatus(id: number, status: string): Promise<Website>;
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getWebsiteReport(websiteId: number): Promise<Report | undefined>;
}

export class MemStorage implements IStorage {
  private websites: Map<number, Website>;
  private reports: Map<number, Report>;
  private websiteId: number;
  private reportId: number;

  constructor() {
    this.websites = new Map();
    this.reports = new Map();
    this.websiteId = 1;
    this.reportId = 1;
  }

  async createWebsite(website: InsertWebsite): Promise<Website> {
    const id = this.websiteId++;
    const newWebsite: Website = {
      id,
      url: website.url,
      status: "pending",
      createdAt: new Date(),
    };
    this.websites.set(id, newWebsite);
    return newWebsite;
  }

  async getWebsite(id: number): Promise<Website | undefined> {
    return this.websites.get(id);
  }

  async updateWebsiteStatus(id: number, status: string): Promise<Website> {
    const website = await this.getWebsite(id);
    if (!website) throw new Error("Website not found");
    
    const updatedWebsite = { ...website, status };
    this.websites.set(id, updatedWebsite);
    return updatedWebsite;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const id = this.reportId++;
    const newReport: Report = {
      id,
      ...report,
      createdAt: new Date(),
    };
    this.reports.set(id, newReport);
    return newReport;
  }

  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getWebsiteReport(websiteId: number): Promise<Report | undefined> {
    return Array.from(this.reports.values()).find(
      (report) => report.websiteId === websiteId
    );
  }
}

export const storage = new MemStorage();
