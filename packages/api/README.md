# Goinfer api

[![pub package](https://img.shields.io/npm/v/@goinfer/api)](https://www.npmjs.com/package/@goinfer/api)

Javascript api for the [Goinfer](https://github.com/synw/goinfer) inference server. 

:books: [Api Doc](https://synw.github.io/goinfer-js/api/index.html)

Below is a basic AI generated documentation (using Mistral 7B Instruct):

The Goinfer API is a library that provides a simple and easy-to-use interface for interacting with a Goinfer server

## Getting Started

To use the Goinfer API, you need to install it using npm:

```bash
npm install @goinfer/api
```

Once installed, you can import the API into your TypeScript project and start using it:

```typescript
import { useGoinfer } from '@goinfer/api';

const api = useGoinfer({
  serverUrl: 'http://localhost:5143',
  apiKey: 'my-api-key',
});
```
In this example, we are importing the `useGoinfer` hook from the `@goinfer/api` library and passing it a configuration object with the server URL and API key.

## API Reference

The Goinfer API provides a number of functions and types that you can use to interact with the Goinfer server. Here is a reference to the API:

### `useGoinfer`

The `useGoinfer` hook is a higher-order component that wraps your application and provides access to the Goinfer API. It takes a configuration object as an argument and returns a new component that you can use in your application.

#### Configuration

The configuration object passed to the `useGoinfer` hook should have the following properties:

* `serverUrl`: The URL of the Goinfer server.
* `apiKey`: The API key to authenticate with the Goinfer server.

#### Example

Here is an example of how to use the `useGoinfer` hook:
```typescript
import { useGoinfer } from '@goinfer/api';

const api = useGoinfer({
  serverUrl: 'http://localhost:5143',
  apiKey: 'my-api-key',
});

function App() {
  const { isRunning, isStreaming, isModelLoaded, loadedModel, ctx } = api;

  const handleInfer = async (prompt: string, template?: string, params?: InferParams) => {
    const result = await api.infer(prompt, template, params);
    console.log(result);
  };

  return (
    <div>
      <button onClick={() => handleInfer('Hello world')}>Infer</button>
      <button onClick={() => handleInfer('Hello world', 'Greetings template')}>Infer with template</button>
    </div>
  );
}
```
In this example, we are using the `useGoinfer` hook to create a new component that has access to the Goinfer API. We are then using the `infer` function to perform an inference with a prompt and an optional template and parameters.

### `infer`

The `infer` function is used to perform an inference with a prompt and an optional template and parameters. It takes the following arguments:

* `prompt`: The input string for which the inference is to be generated.
* `template`: Optional template to guide the inference.
* `params`: Optional parameters for the inference process.

The function returns a promise that resolves to the result of the inference.

#### Example

Here is an example of how to use the `infer` function:
```typescript
const result = await api.infer('Hello world');
console.log(result.text);
```
In this example, we are using the `infer` function to perform an inference with a prompt and then logging the result to the console.

### `abort`

The `abort` function is used to abort any ongoing inference. It takes no arguments and returns a promise that resolves to the completion of the abort process.

#### Example

Here is an example of how to use the `abort` function:
```typescript
api.infer('Hello world').then(console.log);
api.abort();
```
In this example, we are performing an inference with a prompt and then aborting it.

### `loadModel`

The `loadModel` function is used to load a model using the provided configuration. It takes the following argument:

* `modelConf`: Configuration of the model to be loaded.

The function returns a promise that resolves to the completion of the model loading process.

#### Example

Here is an example of how to use the `loadModel` function:
```typescript
const modelConfig = { name: 'MyModel', ctx: 512 };
await api.loadModel(modelConfig);
```
In this example, we are loading a model using the provided configuration.

### `unloadModel`

The `unloadModel` function is used to unload the currently loaded model. It takes no arguments and returns a promise that resolves to the completion of the model unloading process.

#### Example

Here is an example of how to use the `unloadModel` function:
```typescript
await api.unloadModel();
```
In this example, we are unloading the currently loaded model.

### `modelsState`

The `modelsState` function is used to retrieve the state of the available models on the server. It takes no arguments and returns a promise that resolves to the current state of the models.

#### Example

Here is an example of how to use the `modelsState` function:
```typescript
const state = await api.modelsState();
console.log(state.loadedModel);
```
In this example, we are retrieving the state of the available models on the server and logging the loaded model to the console.

### `loadTasks`

The `loadTasks` function is used to load a list of available tasks from the server. It takes no arguments and returns a promise that resolves to a list of available tasks.

#### Example

Here is an example of how to use the `loadTasks` function:
```typescript
const tasks = await api.loadTasks();
console.log(tasks);
```
In this example, we are loading a list of available tasks from the server and logging it to the console.

### `loadTask`

The `loadTask` function is used to load the details of a specific task using its path. It takes the following argument:

* `path`: The path identifier of the task.

The function returns a promise that resolves to the details of the task.

#### Example

Here is an example of how to use the `loadTask` function:
```typescript
const task = await api.loadTask('my/task/path');
console.log(task.name);
```
In this example, we are loading the details of a specific task using its path and logging the task name to the console.

### `executeTask`

The `executeTask` function is used to execute a specific task with the provided name and prompt. It takes the following arguments:

* `name`: The name identifier of the task.
* `prompt`: The input string to provide to the task.

The function returns a promise that resolves to the completion of the task execution.

#### Example

Here is an example of how to use the `executeTask` function:
```typescript
await api.executeTask("code/fix/json", "{'a':1,}");
```
In this example, we are executing a specific task with the provided name and prompt.

## Conclusion

The Goinfer API provides a simple and easy-to-use interface for interacting with a Goinfer server. With the API, you can perform inferences, load models, and execute tasks on the server.