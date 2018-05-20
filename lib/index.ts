import * as querystring from "querystring";

export interface ICaddyHeaders {
	[name: string]: string[];
}

export interface IExpressHeaders {
	[name: string]: string;
}

export interface ICaddyEvent {
	meta: {
		path: string;
		method: string;
		headers: ICaddyHeaders;
		query: string;
	};
	body: string;
}

export interface IExpressResponse {
	statusCode: number;
	headers: IExpressHeaders;
	body: string;
	[propName: string]: any;
}

export interface ICaddyResponse {
	type: "HTTPJSON-REP";
	meta: {
		status: number,
		headers: ICaddyHeaders,
	};
	body: string;
}

export interface ILambdaContext {
	succeed: (response: ICaddyResponse) => void;
	[propName: string]: any;
}

export function transformEvent(event: ICaddyEvent) {
	return {
		resource: event.meta.path,
		path: event.meta.path,
		httpMethod: event.meta.method,
		headers: transformHeadersIn(event.meta.headers),
		queryStringParameters: querystring.parse(event.meta.query),
		body: event.body,

		isBase64Encoded: false,
		requestContext: {
			identity: {},
		},
	};
}

export function transformContext(context: ILambdaContext) {
	const _context = Object.assign({}, context, {
		succeed: (response: IExpressResponse) => context.succeed(transformResponse(response)),
	});

	return _context;
}

function transformHeadersIn(headers: ICaddyHeaders) {
	const _headers = {} as IExpressHeaders;

	for (const key in headers) {
		_headers[key] = headers[key][0]
	}

	return _headers;
}

function transformHeadersOut(headers: IExpressHeaders) {
	const _headers = {} as ICaddyHeaders;

	for (const key in headers) {
		_headers[key] = [headers[key]];
	}

	return _headers;
}

function transformResponse(response: IExpressResponse): ICaddyResponse {
	return {
		type: "HTTPJSON-REP",
		meta: {
			status: response.statusCode,
			headers: transformHeadersOut(response.headers),
		},
		body: response.body,
	};
}
