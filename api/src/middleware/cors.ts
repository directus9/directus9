import cors from 'cors';
import type { RequestHandler } from 'express';
import emitter from '../emitter.js';
import { getEnv } from '../env.js';

let _corsMiddleware: RequestHandler ;

function setCorsMiddlewareFromEnvVariable(){
	const env = getEnv();
	if (env['CORS_ENABLED'] === true) {
		_corsMiddleware = cors({
			origin: env['CORS_ORIGIN'] || true,
			methods: env['CORS_METHODS'] || 'GET,POST,PATCH,DELETE',
			allowedHeaders: env['CORS_ALLOWED_HEADERS'],
			exposedHeaders: env['CORS_EXPOSED_HEADERS'],
			credentials: env['CORS_CREDENTIALS'] || undefined,
			maxAge: env['CORS_MAX_AGE'] || undefined,
		});
	}
	else{
		_corsMiddleware = (_req, _res, next) => next()
	}
}

emitter.onAction('env.update', ()=>{
	setCorsMiddlewareFromEnvVariable();
})

//first init;
setCorsMiddlewareFromEnvVariable();

const corsMiddleware : RequestHandler = (_req, _res, next)=>{
	//allow to dynamically change _corsMiddleware
	//because env variable can be changed during runtime
	_corsMiddleware(_req, _res, next)
}

export default corsMiddleware;
