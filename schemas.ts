import { z } from "zod";

// --- Nodes Schema ---
export const NodeSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['menu_item', 'class', 'news']).default('news'),
  image: z.string().optional(),
  price: z.string().optional(),
  date: z.coerce.date().optional(),
  draft: z.boolean().optional().default(false),
  taxonomies: z.array(z.string()).optional().default([]),
});

// --- Pages Schema ---
export const PageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  layout: z.string().optional().default('default'),
  draft: z.boolean().optional().default(false),
});

// --- Settings Schemas ---
export const SettingsArgsSchema = z.object({
  setting_type: z.enum(["business", "navigation", "site"]),
  locale: z.string().default("ru"),
});

export const UpdateSettingsArgsSchema = z.object({
  setting_type: z.enum(["business", "navigation", "site"]),
  locale: z.string().default("ru"),
  payload: z.any(),
});

// --- Tool Argument Schemas ---
export const NodeToolArgsSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['menu_item', 'class', 'news']).optional(),
  locale: z.string().default("ru"),
  payload: z.any().optional(),
});

export const PageToolArgsSchema = z.object({
  id: z.string().optional(),
  locale: z.string().default("ru"),
  payload: z.any().optional(),
});
