import { z } from 'zod';

export const pageTypeSchema = z.enum(['homepage', 'privacy', 'terms']);

const thirdPartyServiceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
});

const featureSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
});

const stepSchema = z.object({
  icon: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
});

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const homepageSchema = z
  .object({
    slogan: z.string().min(1),
    sub_slogan: z.string().min(1),
    app_icon: z.string().min(1),
    app_store_url: z.string().min(1),
    features: z.array(featureSchema),
    faqs: z.array(faqSchema),
    steps: z.array(stepSchema).optional(),
    screenshots: z.array(z.string().min(1)).optional(),
    section_copy: z
      .object({
        screenshots_title: z.string().optional(),
        steps_title: z.string().optional(),
        steps_subtitle: z.string().optional(),
        support_title: z.string().optional(),
        support_subtitle: z.string().optional(),
        download_label: z.string().optional(),
      })
      .optional(),
    feature_image_max_width: z.string().optional(),
    feature_image_max_height: z.string().optional(),
    support_email_subject: z.string().optional(),
    support_email_body: z.string().optional(),
    theme_color: z.string().optional(),
    theme_secondary_color: z.string().optional(),
    theme_accent_color: z.string().optional(),
    company_name: z.string().optional(),
    company_url: z.string().optional(),
  })
  .passthrough();

const privacySectionSchema = z.object({
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).optional(),
  items: z.array(z.string().min(1)).optional(),
});

const legalSchema = z.object({
  privacy: z
    .object({
      intro: z.string().optional(),
      sections: z.array(privacySectionSchema).optional(),
    })
    .optional(),
  terms: z
    .object({
      service_description: z.string().optional(),
      url: z.string().url().optional(),
    })
    .optional(),
});

export const appSchema = z
  .object({
    key: z.string().regex(/^[a-z0-9-]+$/),
    domain: z.string().min(1).optional(),
    name: z.string().min(1),
    email: z.string().email(),
    updated_date: z.string().min(1),
    has_iap: z.boolean(),
    third_party_services: z.array(thirdPartyServiceSchema),
    pages: z.array(pageTypeSchema).min(1),
    homepage: homepageSchema.optional(),
    legal: legalSchema.optional(),
  })
  .superRefine((app, context) => {
    if (app.pages.includes('homepage') && !app.homepage) {
      context.addIssue({
        code: 'custom',
        path: ['homepage'],
        message: 'homepage config is required when pages includes homepage',
      });
    }
  });

export const appsSchema = z.array(appSchema).superRefine((apps, context) => {
  const keys = new Set<string>();
  const domains = new Set<string>();

  apps.forEach((app, index) => {
    if (keys.has(app.key)) {
      context.addIssue({
        code: 'custom',
        path: [index, 'key'],
        message: `duplicate app key: ${app.key}`,
      });
    }
    keys.add(app.key);

    if (!app.domain) return;
    const domain = app.domain.toLowerCase();
    if (domains.has(domain)) {
      context.addIssue({
        code: 'custom',
        path: [index, 'domain'],
        message: `duplicate app domain: ${domain}`,
      });
    }
    domains.add(domain);
  });
});

export type AppConfig = z.infer<typeof appSchema>;
export type PageType = z.infer<typeof pageTypeSchema>;
