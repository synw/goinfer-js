/** Template information for model
*
* @interface ModelTemplate
* @property {string} name - The name of the template
* @property {number} ctx - The context window size for the model
*/
interface ModelTemplate {
  name: string;
  ctx: number;
}

/**
 * Represents the state of the available models on server.
 *
 * @interface ModelState
 * @property {Record<string, ModelTemplate>;} models - The models info object (name, template name, context window size)
 * @property {boolean} isModelLoaded - Indicates whether a model is loaded or not.
 * @property {string} loadedModel - The name of the loaded model, empty if no model is loaded.
 * @property {number} ctx - The context value.
 */
interface ModelState {
  models: Record<string, ModelTemplate>;
  isModelLoaded: boolean;
  loadedModel: string;
  ctx: number;
}

/**
 * Represents the statistics related to the inference process.
 *
 * @interface TempInferStats
 * @property {number} thinkingTime - The amount of time taken for thinking during the inference.
 * @property {string} thinkingTimeFormat - The format of the thinking time (e.g., milliseconds, seconds).
 */
interface TempInferStats {
  thinkingTime: number;
  thinkingTimeFormat: string;
}

/**
 * Represents the result of an inference process, extending the TempInferStats interface.
 *
 * @interface InferResult
 * @extends TempInferStats
 * @property {string} text - The text associated with the inference result.
 * @property {number} inferenceTime - The time taken for the inference process in milliseconds.
 * @property {number} emitTime - The time taken for emitting in milliseconds.
 * @property {string} emitTimeFormat - The formatted string representation of the emit time.
 * @property {number} totalTime - The total time taken for the inference process and emitting in milliseconds.
 * @property {string} totalTimeFormat - The formatted string representation of the total time.
 * @property {number} tokensPerSecond - The number of tokens processed per second.
 * @property {number} totalTokens - The total number of tokens processed.
 */
interface InferResult extends TempInferStats {
  text: string;
  inferenceTime: number;
  emitTime: number;
  emitTimeFormat: string;
  totalTime: number;
  totalTimeFormat: string;
  tokensPerSecond: number;
  totalTokens: number;
}

/**
 * Represents the parameters for the inference process.
 *
 * @interface InferParams
 * @property {boolean} stream - Indicates whether the inference should be performed in streaming mode.
 * @property {ModelConf} model - The model config to use
 * @property {number} threads - The number of threads to use for the inference process.
 * @property {number} n_predict - The number of predictions to generate.
 * @property {number} top_k - The number of top predictions to consider.
 * @property {number} top_p - The top cumulative probability threshold for predictions.
 * @property {number} temperature - The temperature value for controlling the randomness of predictions.
 * @property {number} frequency_penalty - The penalty factor for repeated tokens in predictions.
 * @property {number} presence_penalty - The penalty factor for tokens not present in predictions.
 * @property {number} repeat_penalty - The penalty factor for repeated sequences in predictions.
 * @property {number} tfs_z - The z-score threshold for filtering predictions.
 * @property {Array<string>} stop - The list of stop words to use for stopping the inference process.
 */
interface InferParams {
  stream?: boolean;
  model?: ModelConf;
  threads?: number;
  n_predict?: number;
  top_k?: number;
  top_p?: number;
  temperature?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  repeat_penalty?: number;
  tfs_z?: number;
  stop?: Array<string>;
}

/**
 * Represents the configuration of a model.
 *
 * @interface ModelConf
 * @property {string} name - The name of the model.
 * @property {number} ctx - The context value.
 * @property {number | undefined} [rope_freq_scale] - The rope frequency scale (optional).
 * @property {number | undefined} [rope_freq_base] - The rope frequency base (optional).
 */
interface ModelConf {
  name: string,
  ctx: number,
  rope_freq_scale?: number,
  rope_freq_base?: number,
}


/**
 * Represents a task.
 *
 * @interface Task
 * @property {string} name - The name of the task.
 * @property {string} template - The template associated with the task.
 * @property {ModelConf} modelConf - The configuration of the model.
 * @property {Object} inferParams - Inference parameters.
 * @property {boolean} [inferParams.stream] - Indicates whether the inference should be performed in streaming mode.
 * @property {number | undefined} [inferParams.threads] - The number of threads to use for inference.
 * @property {number | undefined} [inferParams.n_predict] - The number of predictions to generate.
 * @property {number | undefined} [inferParams.top_k] - The top k predictions to consider.
 * @property {number | undefined} [inferParams.top_p] - The top p predictions to consider.
 * @property {number | undefined} [inferParams.temperature] - The temperature value for sampling.
 * @property {number | undefined} [inferParams.frequency_penalty] - The frequency penalty value.
 * @property {number | undefined} [inferParams.presence_penalty] - The presence penalty value.
 * @property {number | undefined} [inferParams.repeat_penalty] - The repeat penalty value.
 * @property {number | undefined} [inferParams.tfs_z] - The tfs z value.
 * @property {Array<string> | undefined} [inferParams.stop] - An array of stop words.
 */
interface Task {
  name: string;
  template: string;
  modelConf: ModelConf;
  inferParams: InferParams,
}


enum MsgType {
  TokenMsgType = "token",
  SystemMsgType = "system",
  ErrorMsgType = "error",
}

/**
 * Represents a streamed message.
 *
 * @interface StreamedMessage
 * @property {string} content - The content of the message.
 * @property {number} num - The number associated with the message.
 * @property {MsgType} type - The type of the message.
 * @property {Object.<string, any> | undefined} [data] - Additional data associated with the message.
 */
interface StreamedMessage {
  content: string;
  num: number;
  type: MsgType;
  data?: { [key: string]: any };
}

/**
 * Represents the parameters for the Goinfer initialization.
 *
 * @interface GoinferParams
 * @property {string} serverUrl - The URL of the server.
 * @property {string} apiKey - The API key to authenticate.
 * @property {(t: string) => void} onToken - A callback function that receives a string token.
 * @property {(s: TempInferStats) => void | undefined} [onStartEmit] - An optional callback function that receives TempInferStats when the inference process starts emitting.
 * @property {(e: string) => void | undefined} [onError] - An optional callback function that receives an error message in case of any errors during the inference process.
 */
interface GoinferParams {
  serverUrl: string;
  apiKey: string;
  onToken?: (t: string) => void;
  onStartEmit?: (s: TempInferStats) => void;
  onError?: (e: string) => void;
}

export {
  ModelState,
  ModelTemplate,
  InferResult,
  TempInferStats,
  InferParams,
  Task,
  StreamedMessage,
  ModelConf,
  GoinferParams,
  MsgType,
}