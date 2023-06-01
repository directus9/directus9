import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('directus_settings', (table) => {
		table.boolean('env_cors_enabled');
		table.string('env_cors_origin');
		table.string('env_cors_methods');
		table.string('env_cors_allowed_headers');
		table.string('env_cors_exposed_headers');
		table.string('env_cors_credentials');
		table.string('env_cors_max_age');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('directus_settings', (table) => {
		table.dropColumn('env_cors_enabled');
		table.dropColumn('env_cors_origin');
		table.dropColumn('env_cors_methods');
		table.dropColumn('env_cors_allowed_headers');
		table.dropColumn('env_cors_exposed_headers');
		table.dropColumn('env_cors_credentials');
		table.dropColumn('env_cors_max_age');
	});
}
