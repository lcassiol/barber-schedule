CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
CREATE TYPE "appointment_source" AS ENUM ('public', 'admin');
--> statement-breakpoint
CREATE TABLE "barbers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(100) NOT NULL,
  "slug" varchar(80) NOT NULL,
  "timezone" varchar(100) NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "barbers_slug_idx" ON "barbers" ("slug");
--> statement-breakpoint
CREATE TABLE "admin_credentials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "barber_id" uuid NOT NULL REFERENCES "barbers"("id") ON DELETE CASCADE,
  "username" varchar(80) NOT NULL,
  "password_hash" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admin_credentials_username_idx" ON "admin_credentials" ("username");
CREATE UNIQUE INDEX "admin_credentials_barber_idx" ON "admin_credentials" ("barber_id");
--> statement-breakpoint
CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "credential_id" uuid NOT NULL REFERENCES "admin_credentials"("id") ON DELETE CASCADE,
  "token_hash" varchar(64) NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "revoked_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_idx" ON "sessions" ("token_hash");
CREATE INDEX "sessions_expiry_idx" ON "sessions" ("expires_at");
--> statement-breakpoint
CREATE TABLE "weekly_work_periods" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "barber_id" uuid NOT NULL REFERENCES "barbers"("id") ON DELETE CASCADE,
  "weekday" integer NOT NULL CHECK ("weekday" BETWEEN 1 AND 7),
  "start_time" time(0) NOT NULL,
  "end_time" time(0) NOT NULL,
  CONSTRAINT "weekly_work_periods_order_check" CHECK ("end_time" > "start_time")
);
--> statement-breakpoint
CREATE INDEX "weekly_work_periods_barber_day_idx" ON "weekly_work_periods" ("barber_id", "weekday");
--> statement-breakpoint
CREATE TABLE "appointments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "barber_id" uuid NOT NULL REFERENCES "barbers"("id") ON DELETE CASCADE,
  "start_at" timestamptz NOT NULL,
  "end_at" timestamptz NOT NULL,
  "customer_name" varchar(100) NOT NULL,
  "customer_phone" varchar(30) NOT NULL,
  "notes" varchar(500),
  "source" "appointment_source" NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "appointments_order_check" CHECK ("end_at" > "start_at"),
  CONSTRAINT "appointments_one_hour_check" CHECK ("end_at" = "start_at" + interval '1 hour'),
  CONSTRAINT "appointments_no_overlap" EXCLUDE USING gist (
    "barber_id" WITH =,
    tstzrange("start_at", "end_at", '[)') WITH &&
  )
);
--> statement-breakpoint
CREATE INDEX "appointments_barber_start_idx" ON "appointments" ("barber_id", "start_at");
