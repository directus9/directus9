import { getEnv, setEnv } from "./env.js";
import getDatabase from "./database/index.js";
import emitter from "./emitter.js";
import { getMessenger } from "./messenger.js";

const _initialEnv = getEnv();
/**
 * When changes have been made during runtime, like in the CLI, we can refresh the env object with
 * the newly created variables
 */
export async function refreshEnv(): Promise<Record<string, any>> {
	const newEnv = await processConfigurationFromDatabase(_initialEnv);
	setEnv(newEnv);

	emitter.emitAction('env.update', newEnv, {
		database: getDatabase(),
		schema: null,
		accountability: null
	})
	return getEnv();
}

/**
 * We can store some environment values in the database
 * We can not store secrets in the db
 * We can not store DB_CONFIG... in the db
 */
async function processConfigurationFromDatabase(env : Record<string, any>){
	const knex = getDatabase()

	const settings = await knex.select()
								.from('directus_settings')
								.limit(1)
								.first()

	const envInDatabase : Record<string, any> = {};

	for (let [key, value] of Object.entries(settings)) {
		if(key.includes('env_')){
			key = key.replace('env_', '').toUpperCase();
			envInDatabase[key] = String(value);
		}
	}

	return {
		...env,
		...envInDatabase
	}
}


/**
 * Env variable in database can be modified during runtime
 * As a consequence, we have to reload the env variables each time an env variable is modified in db
 * And this reload has to happen on every node on the cluster (if there is a cluster)
 */
const messenger = getMessenger();

messenger.subscribe('envChanged', ()=>{
	refreshEnv();
})


emitter.onAction('settings.update', envModificationActionHandler)
emitter.onAction('settings.create', envModificationActionHandler)
emitter.onAction('settings.delete', envModificationActionHandler)

function envModificationActionHandler(meta: Record<string, any>){
	const modifiedKeys = Object.keys(meta["payload"] || {});
	if(modifiedKeys.find(k=>k.includes('env_'))){
		messenger.publish('envChanged', {})
	}
		
}

//first init
await refreshEnv();
