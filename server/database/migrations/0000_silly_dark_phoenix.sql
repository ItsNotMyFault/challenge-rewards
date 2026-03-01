CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"goal" integer NOT NULL,
	"donation_url" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fundraisers" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"avatar_color" text DEFAULT 'blue' NOT NULL,
	"goal" integer NOT NULL,
	"raised" integer DEFAULT 0 NOT NULL,
	"twitch_url" text DEFAULT '' NOT NULL,
	"donation_url" text DEFAULT '' NOT NULL,
	"reward_catalog_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redeems" (
	"id" serial PRIMARY KEY NOT NULL,
	"fundraiser_id" integer NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"redeemer" text NOT NULL,
	"reward_name" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"required_ms" integer,
	"accumulated_ms" integer,
	"timer_started_at" timestamp with time zone,
	"quantity" integer,
	"total_redeemed" integer,
	"total_consumed" integer,
	"completed_at" timestamp with time zone,
	"target_count" integer,
	"current_count" integer,
	"activated_at" timestamp with time zone,
	"deactivated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"preset_id" text,
	"reward_name" text NOT NULL,
	"type" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	"required_ms" integer,
	"quantity" integer,
	"target_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rewards_preset_id_unique" UNIQUE("preset_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"google_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "fundraisers" ADD CONSTRAINT "fundraisers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fundraisers" ADD CONSTRAINT "fundraisers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeems" ADD CONSTRAINT "redeems_fundraiser_id_fundraisers_id_fk" FOREIGN KEY ("fundraiser_id") REFERENCES "public"."fundraisers"("id") ON DELETE cascade ON UPDATE no action;