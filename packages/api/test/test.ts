import { useGoinfer } from '../src/main';

const model = "mistral-7b-instruct-v0.1.Q4_K_M.gguf";
const template = `<s>[INST] {prompt} [/INST]`;
const prompt = "What is the capital of Italy?"

const api = useGoinfer({
  serverUrl: 'http://localhost:5143',
  apiKey: "7aea109636aefb984b13f9b6927cd174425a1e05ab5f2e3935ddfeb183099465",
  onToken: (t: string) => {
    //console.log("Token", t)
    expect(t).not.toBeNull();
  },
});

describe('goinfer', () => {
  it('models state', async () => {
    await api.unloadModel();
    const data = await api.modelsState();
    expect(data.isModelLoaded).toBeFalsy();
    expect(data.loadedModel).toBe("");
  });
  it('load model', async () => {
    await api.unloadModel();
    expect(api.loadModel({ name: "wrong", ctx: 2048 })).rejects.toThrow('error loading model: can not load model wrong')
    expect(async () => await api.loadModel({ name: model, ctx: 2048 })).not.toThrowError();
  });
  it('unload model', async () => {
    await api.loadModel({ name: model, ctx: 2048 });
    expect(api.isModelLoaded).toBeTruthy();
    await api.unloadModel();
    expect(api.isModelLoaded).toBeFalsy();
  });
  it('infer', async () => {
    await api.unloadModel();
    expect(api.isRunning).toBeFalsy();
    expect(api.isStreaming).toBeFalsy();
    expect(api.infer(prompt, template, { stream: true })).rejects.toThrow("no model loaded");
    await api.loadModel({ name: model, ctx: 2048 });
    await api.infer(prompt, template, { stream: true });
  });
  it('load task', async () => {
    const task = await api.loadTask("code/json/fix");
    expect(task.name).toBe("fix_json")
  });
  it('load tasks tree', async () => {
    const tasks = await api.loadTasks();
    //console.log(JSON.stringify(tasks, null, "  "));
    expect(tasks.length).toBeGreaterThan(0)
  });
  it('task', async () => {
    if (!api.isModelLoaded) {
      await api.loadModel({ name: model, ctx: 2048 });
    }
    const task = await api.executeTask("test/test", "list the planets in the solar system");
    console.log("Task", task);
  });
  /*it('abort', async () => {
  expect(api.isRunning).toBeFalsy();
  expect(api.isStreaming).toBeFalsy();
  api.infer(prompt, template);
  expect(api.isRunning).toBeTruthy();
  setTimeout(() => {
    api.abort();
    expect(api.isRunning).toBeFalsy();
    expect(api.isStreaming).toBeFalsy();
  }, 500);
});*/
});