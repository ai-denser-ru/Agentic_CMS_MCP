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

// --- Blocks Schema ---
export const BlockSchema = z.object({
  title: z.string(),
  block_type: z.enum(['promo', 'testimonial', 'cta']).default('promo'),
  placement: z.string().optional().default('sidebar'),
  weight: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
});

// --- Taxonomy Schema ---
export const TaxonomySchema = z.object({
  title: z.string(),
  vocabulary: z.enum(['category', 'level', 'tag']).default('category'),
  weight: z.number().optional().default(0),
});

// --- Staff Schema ---
export const StaffSchema = z.object({
  title: z.string(),
  role: z.string(),
  bio: z.string().optional(),
  image: z.string().optional(),
  email: z.string().email().optional(),
  order: z.number().optional().default(0),
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

export const BlockToolArgsSchema = z.object({
  id: z.string().optional(),
  locale: z.string().default("ru"),
  payload: z.any().optional(),
});

export const TaxonomyToolArgsSchema = z.object({
  id: z.string().optional(),
  locale: z.string().default("ru"),
  payload: z.any().optional(),
});

export const StaffToolArgsSchema = z.object({
  id: z.string().optional(),
  locale: z.string().default("ru"),
  payload: z.any().optional(),
});
