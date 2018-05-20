# caddy-serverless-express
A Node.js module that enables [aws-serverless-express](https://github.com/awslabs/aws-serverless-express) to work with [erdii/caddy-awslambda](https://github.com/erdii/caddy-awslambda/)

## Installation 
```sh
npm install @erdii/caddy-serverless-express --save
yarn add @erdii/caddy-serverless-express
```

## Usage

### Javascript

```javascript
// index.js
const {
	transformEvent,
	transformContext,
} = require('@erdii/caddy-serverless-express');
const awsServerlessExpress = require("aws-serverless-express");

const app = require("./app");

const server = awsServerlessExpress.createServer(app);

exports.handle = (event, context, callback) => {
	try {
		return awsServerlessExpress.proxy(server, transformEvent(event), transformContext(context));
	} catch (err) {
		context.succeed({
			error: {
				_err: err,
				name: err.name,
				message: err.message,
			},
		});
		return;
	}
}

// app.js
const express = require("express");
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

const app = express();
app.set("trust proxy", true);
app.use(awsServerlessExpressMiddleware.eventContext())

app.get("/api", (req, res) => {
	res.json({
		path: req.path,
		query: req.query,
		ip: req.ip,
		hello: "world",
	});
});

module.exports = app;
```
```sh
curl -s -X GET http://localhost:8080/api/\?hi\=there
Output should be '{"path":"/api/","query":{"hi":"there"},"ip":"::1","hello":"world"}
```

### TypeScript
```typescript
// index.ts
import {
	transformContext,
	transformEvent,
} from "@erdii/caddy-serverless-express";
import awsServerlessExpress from "aws-serverless-express";

import { app } from "./app";

const server = awsServerlessExpress.createServer(app);

export const handle = (event: any, context: any, callback: any) => {
	try {
		return awsServerlessExpress.proxy(
			server,
			transformEvent(event),
			transformContext(context) as any
		);
	} catch (err) {
		context.succeed({
			error: {
				_err: err,
				name: err.name,
				message: err.message,
			},
		});
		return;
	}
}

//app.ts
import express from "express";
import * as awsServerlessExpressMiddleware from "aws-serverless-express/middleware";

export const app = express();
app.set("trust proxy", true);
app.use(awsServerlessExpressMiddleware.eventContext())

app.get("/api", (req, res) => {
	res.json({
		path: req.path,
		query: req.query,
		ip: req.ip,
		hello: "world",
	});
});
```
```sh
curl -s -X GET http://localhost:8080/api/\?hi\=there
Output should be '{"path":"/api/","query":{"hi":"there"},"ip":"::1","hello":"world"}
```

## Test
```sh
npm run test
```

## Example Caddyfile
```caddyfile
http://localhost:8080 {
	gzip

	awslambda /api/ {
		aws_region eu-central-1
		aws_access <YOUR_AWS_ACCESS_KEY>
		aws_secret <YOUE_AWS_SECRET_KEY>

		single <YOUR-LAMBDA-FUNCTION-NAME>

		header_upstream X-Forwarded-For {remote}
		header_upstream X-Forwarded-Host {hostonly}
		header_upstream X-Forwarded-Proto {scheme}
	}
}
```
