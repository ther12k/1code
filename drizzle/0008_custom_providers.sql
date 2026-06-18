CREATE TABLE `custom_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`base_url` text NOT NULL,
	`api_key_encrypted` text NOT NULL,
	`default_model` text,
	`models_json` text,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
