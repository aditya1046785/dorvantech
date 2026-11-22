import { MockAgent, getGlobalDispatcher, setGlobalDispatcher } from "undici";

export function mockBlobStorage() {
  const previous = getGlobalDispatcher();
  const previousToken = process.env.BLOB_READ_WRITE_TOKEN;
  const previousOidc = process.env.VERCEL_OIDC_TOKEN;
  const agent = new MockAgent();
  agent.disableNetConnect();
  setGlobalDispatcher(agent);
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_teststore_testsecret";
  delete process.env.VERCEL_OIDC_TOKEN;
  const api = agent.get("https://vercel.com");
  const files = agent.get("https://teststore.private.blob.vercel-storage.com");
  return {
    agent,
    api,
    files,
    async close() {
      setGlobalDispatcher(previous);
      if (previousToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
      else process.env.BLOB_READ_WRITE_TOKEN = previousToken;
      if (previousOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN;
      else process.env.VERCEL_OIDC_TOKEN = previousOidc;
      await agent.close();
    },
  };
}
