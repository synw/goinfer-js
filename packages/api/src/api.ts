import { useApi } from "restmix";
import type { InferParams, InferResult, ModelConf, StreamedMessage, Task, ModelState, GoinferParams, TempInferStats } from "@goinfer/types";

/** The main api composable */
const useGoinfer = (initParams: GoinferParams) => {
  let isRunning = false;
  let isStreaming = false;
  let isModelLoaded = false;
  let isLoadingModel = false;
  let abortController = new AbortController();
  let model: ModelConf = { name: "", ctx: 2048 };
  let onToken = initParams.onToken;
  let onStartEmit = initParams.onStartEmit;
  let onError = initParams.onError;

  // options
  const api = useApi({
    serverUrl: initParams.serverUrl,
  });
  api.addHeader("Authorization", `Bearer ${initParams.apiKey}`);

  const infer = async (prompt: string, template?: string, params?: InferParams): Promise<InferResult> => {
    isRunning = true;
    abortController = new AbortController();
    const paramDefaults = {
      prompt: prompt,
      template: template,
      ...params,
    };
    const inferenceParams = { ...paramDefaults };
    if (inferenceParams?.model) {
      model = inferenceParams.model;
    }
    //console.log("Params", inferenceParams);
    let respData: InferResult = {
      text: "",
      thinkingTime: 0,
      thinkingTimeFormat: "",
      inferenceTime: 0,
      emitTime: 0,
      emitTimeFormat: "",
      totalTime: 0,
      totalTimeFormat: "",
      tokensPerSecond: 0,
      totalTokens: 0,
    };

    if (inferenceParams?.stream == true) {
      const _onChunk = (payload: Record<string, any>) => {
        const msg: StreamedMessage = {
          num: payload["num"],
          type: payload["msg_type"],
          content: payload["content"],
          data: payload["data"] ?? {},
        }
        if (msg.type == "token") {
          //console.log("TOKEN", msg.content, onToken);
          if (onToken) {
            onToken(msg.content);
          }
        } else {
          if (msg.type == "system") {
            if (msg.content == "start_emitting") {
              isStreaming = true;
              if (onStartEmit) {
                onStartEmit(msg.data as TempInferStats)
              }
            } else if (msg.content == "result") {
              respData = msg.data as InferResult;
            }
          } else if (msg.type == "error") {
            if (onError) {
              onError(msg.content)
            } else {
              throw new Error(msg.content)
            }
          }
        }
      }

      await api.postSse<Record<string, any>>(
        "/completion",
        inferenceParams,
        _onChunk,
        abortController,
      )
    } else {
      const res = await api.post<InferResult | StreamedMessage>("/completion", inferenceParams);
      //console.log("RES", res)
      if (res.ok) {
        respData = res.data as InferResult
      } else {
        const msg = res.data as StreamedMessage;
        throw new Error(`${res.statusText} ${msg.content}`);
      }
    }

    isStreaming = false;
    isRunning = false;
    return respData
  }

  async function abort() {
    if (isStreaming) {
      abortController.abort();
    } else {
      const res = await api.get("/completion/abort");
      if (res.ok) {
        isRunning = false;
        isStreaming = false;
      }
    }
  }

  async function modelsState(): Promise<ModelState> {
    const res = await api.get<ModelState>("/model/state");
    //console.log(JSON.stringify(res.data, null, "  "))
    if (res.ok) {
      if (res.data.isModelLoaded) {
        isModelLoaded = true;
        model = { name: res.data.loadedModel, ctx: res.data.ctx };
      }
      return res.data
    }
    throw new Error("Error loading models state")
  }

  async function loadTasks(): Promise<Array<Record<string, any>>> {
    const res = await api.get<Array<Record<string, any>>>("/task/tree");
    //console.log(JSON.stringify(res.data, null, "  "));
    if (res.ok) {
      return res.data
    }
    throw new Error("Error loading tasks")
  }

  async function loadTask(path: string): Promise<Task> {
    const payload = {
      path: path
    }
    let task: Task = {
      name: "",
      template: "",
      modelConf: {} as ModelConf,
      inferParams: {} as InferParams,
    };
    const res = await api.post<Record<string, any>>("/task/read", payload);
    if (res.ok) {
      //console.log("DATA", JSON.stringify(res.data, null, "  "));
      task = {
        name: res.data.name,
        template: res.data.template,
        modelConf: res.data.modelConf,
        inferParams: res.data.inferParams,
      }
    } else {
      if (res.status == 400) {
        throw new Error("Task not found")
      } else {
        throw new Error("Error loading task")
      }
    }
    return task
  }

  async function executeTask(name: string, prompt: string) {
    const res = await api.post<Record<string, any>>("/task/execute", {
      task: name,
      prompt: prompt
    });
    if (res.ok) {
      console.log(res.data);
      return
    }
    throw new Error("Error executing task")
  }

  async function loadModel(modelConf: ModelConf): Promise<void> {
    isModelLoaded = false;
    isLoadingModel = true;
    const res = await api.post<{ error: string }>("/model/load", modelConf);
    if (res.ok) {
      if (res.status == 202) {
        // model is already loaded
        throw new Error(res.data.error)
      }
      model = modelConf;
      isLoadingModel = false;
      isModelLoaded = true;
      return
    }
    throw new Error(res.data.error)
  }

  async function unloadModel(): Promise<void> {
    const res = await api.get("/model/unload");
    if (res.ok) {
      isModelLoaded = false;
      model = { name: "", ctx: 2048 };
      return
    }
    throw new Error("Error unloading model")
  }

  return {
    /**
     * Get the Restmix api object
     * @returns {ReturnType<typeof useApi>}
     */
    get api(): ReturnType<typeof useApi> { return api },
    /**
     * Indicates whether an inference is currently running.
     * @returns {boolean} `true` if an inference is currently running; otherwise, `false`.
     */
    get isRunning(): boolean { return isRunning },

    /**
     * Indicates whether the inference process is streaming the results.
     * @returns {boolean} `true` if the inference results are being streamed; otherwise, `false`.
     */
    get isStreaming(): boolean { return isStreaming },

    /**
     * Indicates whether a model is currently loaded and ready for inferences.
     * @returns {boolean} `true` if a model is currently loaded; otherwise, `false`.
     */
    get isModelLoaded(): boolean { return isModelLoaded },

    /**
     * Indicates whether a model is currently loading
     * @returns {boolean} `true` if a model is currently loading; otherwise, `false`.
     */
    get isLoadingModel(): boolean { return isLoadingModel },

    get model(): ModelConf { return model },

    set onToken(t: ((t: string) => void) | undefined) { onToken = t },
    set onError(t: ((t: string) => void) | undefined) { onError = t },
    set onStartEmit(t: ((s: TempInferStats) => void) | undefined) { onStartEmit = t },

    /**
     * Performs an inference using the provided parameters.
     * 
     * @param {string} _prompt - The input string for which the inference is to be generated.
     * @param {string} [_template] - Optional template to guide the inference.
     * @param {InferParams} [_params] - Optional parameters for the inference process.
     * 
     * @returns {Promise<InferResult>} A promise resolving to the result of the inference.
     * 
     * @example
     * 
     * ```ts
     * const result = await infer(
     *   "prompt text here",
     *   "### Instruction: {prompt}\n\n### Response:",
     *   { top_k: 5 }
     * );
     * console.log(result.text);
     * ```
     */
    /**  
     * Function to perform when a token is received
     * 
     * @param {string} token: the new token
    */
    infer,

    /**
     * Aborts any ongoing inference.
     * 
     * @returns {Promise<void>} A promise indicating the completion of the abort process.
     * 
     * @example
     * 
     * ```ts
     * infer("Hello world").then(console.log);
     * abort();
     * ```
     */
    abort,

    /**
     * Loads a model using the provided configuration.
     * 
     * @param {ModelConf} modelConf - Configuration of the model to be loaded.
     * 
     * @returns {Promise<void>} A promise indicating the completion of the model loading process.
     * 
     * @example
     * 
     * ```ts
     * const modelConfig = { name: "MyModel", ctx: 512 };
     * await loadModel(modelConfig);
     * ```
     */
    loadModel,

    /**
     * Unloads the currently loaded model.
     * 
     * @returns {Promise<void>} A promise indicating the completion of the model unloading process.
     * 
     * @example
     * 
     * ```ts
     * await unloadModel();
     * ```
     */
    unloadModel,

    /**
     * Retrieves the state of the available models on the server.
     * 
     * @returns {Promise<ModelState>} A promise resolving to the current state of the models.
     * 
     * @example
     * 
     * ```ts
     * const state = await modelsState();
     * console.log(loadedModel);
     * ```
     */
    modelsState,

    /**
     * Loads a list of available tasks from the server.
     * 
     * @returns {Promise<Array<Record<string, any>>>} A promise resolving to a list of available tasks.
     * 
     * @example
     * 
     * ```ts
     * const tasks = await loadTasks();
     * console.log(tasks);
     * ```
     */
    loadTasks,

    /**
     * Loads the details of a specific task using its path.
     * 
     * @param {string} path - The path identifier of the task.
     * 
     * @returns {Promise<Task>} A promise resolving to the details of the task.
     * 
     * @example
     * 
     * ```ts
     * const task = await loadTask("/my/task/path");
     * console.log(task.name);
     * ```
     */
    loadTask,

    /**
     * Executes a specific task with the provided name and prompt.
     * 
     * @param {string} name - The name identifier of the task.
     * @param {string} prompt - The input string to provide to the task.
     * 
     * @returns {Promise<void>} A promise indicating the completion of the task execution.
     * 
     * @example
     * 
     * ```ts
     * await executeTask("MyTask", "Hello world");
     * ```
     */
    executeTask,
  }
}

export { useGoinfer }
