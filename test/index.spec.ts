import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
// import worker from '../src/test';

import worker, { add } from "../src/test";

describe("Hello World worker", () => {
  it("adds two numbers", async () => {
    expect(add(2,3)).toBe(5);
  });
  it("sends request (unit style)", async () => {
    const request = new Request("http://example.com/?a=3&b=4");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(await response.text()).toMatchInlineSnapshot(`"7"`);
  });
});