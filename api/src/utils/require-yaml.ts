import fse from 'fs-extra';
import yaml from 'js-yaml';
import { getEnv } from '../env.js';

export function requireYAML(filepath: string): Record<string, any> {
	const yamlRaw = fse.readFileSync(filepath, 'utf8');
	const result = yaml.load(yamlRaw) as Record<string, any>;
	return interpolateEnvSyntaxRecursive(result);
}

/**
 * TODO : remove this by a real templating engine like ejs.
 */
function interpolateEnvSyntaxRecursive(entry : any){
	if(typeof entry === 'string'){
		return interpolateEnvVariable(entry);
	}
	if(typeof entry !== 'object' || !entry){
		return entry;
	}
	for(const [key, value] of Object.entries(entry)){
		entry[key] = interpolateEnvSyntaxRecursive(value);
	}
	return entry
}

function interpolateEnvVariable(fieldValue : string){
	const env = getEnv();
	if(fieldValue.startsWith('$env:')){
		const envKey = fieldValue.replace('$env:', '').toUpperCase();//$env:cors_enabled --> CORS_ENABLED
		return env[envKey]
	}
	if(fieldValue.startsWith('!$env:')){
		const envKey = fieldValue.replace('!$env:', '').toUpperCase();//$env:cors_enabled --> CORS_ENABLED
		return !env[envKey] ;
	}
	return fieldValue;
}
