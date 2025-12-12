CREATE TABLE "portfolios" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "portfolios_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"tech_stack" jsonb DEFAULT '[]'::jsonb,
	"image_url" text,
	"project_url" text,
	"completion_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "experience_years" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "education" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "certifications" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "languages" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "availability" varchar(100);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "timezone" varchar(100);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "company_name" varchar(255);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "company_size" varchar(50);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "industry" varchar(100);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "linkedin" varchar(255);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "github" varchar(255);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "total_jobs_completed" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "success_rate" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "average_response_time" integer;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portfolios_user_id_idx" ON "portfolios" USING btree ("user_id");