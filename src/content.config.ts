import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod'

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    status: z.enum(['live', 'in-development']),
    icon: z.string().nullable().default(null),
    appStoreUrl: z.string().url().nullable().default(null),
  }),
});

export const collections = { products };
