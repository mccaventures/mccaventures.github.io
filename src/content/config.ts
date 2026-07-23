import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    status: z.enum(['live', 'in-development']),
    icon: z.string().nullable().default(null),
    appStoreUrl: z.string().url().nullable().default(null),
  }),
});

export const collections = { projects };
