"use strict";
const expect = require("chai").expect;
const caddyServerless = require("./dist");

describe("transformEvent test", () => {
	it("should return an api-gateway 'compatible' view of the caddy request event", () => {
		const result = caddyServerless.transformEvent({
			body: "test",
			meta: {
				method: "GET",
				path: "/api",
				query: "",
				headers: {
					"accept": ["*/*"],
				},
			}
		});
		expect(result).to.deep.equal({
			resource: "/api",
			path: "/api",
			httpMethod: "GET",
			headers: {
				"accept": "*/*",
			},
			queryStringParameters: {},
			body: "test",
			isBase64Encoded: false,
			requestContext: {
				identity: {},
			},
		});
	});
});
