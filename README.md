## `@posthog/plugin-scaffold`

[![npm](https://img.shields.io/npm/v/@posthog/plugin-scaffold.svg)](https://www.npmjs.com/package/@posthog/plugin-scaffold)

This project contains shared typescript types that PostHog plugin
authors can use.

```bash
# if using yarn
yarn add --dev @posthog/plugin-scaffold

# if using npm
npm install --save-dev @posthog/plugin-scaffold
``` 

Then in your plugins:

```typescript
import { PluginEvent, PluginMeta } from '@posthog/plugin-scaffold'

export function processEvent(event: PluginEvent, meta: PluginMeta) {
    if (event.properties) {
        event.properties['hello'] = 'world'
    }
    return event
}
```
