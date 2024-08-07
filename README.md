# TypeAgent

**TypeAgent** is **sample code** that explores architectures for building _interactive agents_ with _natural language interfaces_ using [TypeChat](https://github.com/microsoft/typechat).

**TypeAgent** uses TypeChat to build a set of example agents that **take actions**. Agents define actions using TypeChat schemas.

The TypeAgent repo contains example agents and applications, along with internal packages used to build them.

## Examples

- Agents with natural language interfaces:

  - [Music Player](./ts/packages/agents/player/)
  - [Chat](./ts/packages/agents/chat/)
  - [Browser](./ts/packages/agents/browser/)
  - [VS Code](./ts/packages/agents/code/)
  - [List Management](./ts/packages/agents/list/)
  - [Calendar](./ts/packages/agents/calendar/)
  - [Email](./ts/packages/agents/email/)
  - [Desktop](./ts/packages/agents/desktop/)

- [Agent Dispatcher](./ts/packages/dispatcher/)

  Explores applying TypeChat to route user requests to agents whose typed contract best matches user intent.

- [Agent Cache](./ts/packages/cache/)

  Explores how TypeChat translations from user intent to actions can be cached, minimizing the need to go the LLM.

- [Agent Shell](./ts/packages/shell/)

  An Electron application for interacting with multiple registered agents using a single unified user interface. Agent Shell includes:

  - Integrated chat experience with voice support
  - Dispatcher that dispatches to registered agents
  - Structured memory
  - Structured RAG

### State Management

All storage, registration, chat, memory and other state maintained by examples is stored **_locally_** in **your user folder** on your development machine. State is typically saved as ordinary text or JSON files in sub-folders below your user folder .

## Intended Uses

- TypeAgent is sample code shared to encourage the exploration of natural language agent architectures using TypeChat.
- Sample agents are not intended to be implemented in real-world settings without further testing/validation.

## Limitations

TypeAgent is early stage sample code over TypeChat. TypeAgent is not a framework. All library code is used to build our own example apps and agents only.

- TypeAgent is in **active development** with frequent updates and refactoring.
- TypeAgent has been tested with Azure Open AI services on developer's own machines only.
- TypeAgent is currently tested in English. Performance may vary in other languages.
- TypeAgent relies on [TypeChat](https://github.com/microsoft/typechat), which uses schema to validate LLM responses. An agent's validity therefore depends on how well _its schema_ represents the user intents and LLM responses _for its domains_.
- You are responsible for supplying any **API keys** used by examples.

## Getting Started

TypeAgent is written in TypeScript and relies on TypeChat. To understand how TypeAgent examples work, we recommend getting comfortable with TypeChat and [TypeChat examples](https://github.com/microsoft/TypeChat/tree/main/typescript/examples) first.

## Developers

Microsoft AI Systems Repo is a mono-repo, with components organized with the following root folders based on language used.

- [`ts`](./ts) TypeScript code ([Readme](./ts/README.md))

### Agent Shell Example

The main entry point to explore TypeAgent is the Agent Shell example. Follow the [instructions](./ts/README.md) in the typescript code [directory](./ts) to get started.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.