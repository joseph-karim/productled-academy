CREATE TABLE IF NOT EXISTS "public"."website_scraping" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "offer_id" text,
  "user_id" uuid,
  "url" text NOT NULL,
  "status" text NOT NULL,
  "title" text,
  "meta_description" text,
  "analysis_result" jsonb,
  "error" text,
  "completed_at" timestamptz,
  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS website_scraping_offer_id_idx ON public.website_scraping USING btree (offer_id);
CREATE INDEX IF NOT EXISTS website_scraping_user_id_idx ON public.website_scraping USING btree (user_id);
CREATE INDEX IF NOT EXISTS website_scraping_status_idx ON public.website_scraping USING btree (status);
