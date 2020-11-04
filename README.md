## `posthog-plugins`

This project contains shared typescript types that PostHog plugin
authors can use.

```bash
# if using yarn
yarn add --dev posthog-plugins

# if using npm
npm install --save-dev posthog-plugins
``` 

Then in your plugins:

```typescript
import { PluginEvent, PluginMeta } from 'posthog-plugins'

export function processEvent(event: PluginEvent, meta: PluginMeta) {
    if (event.properties) {
        event.properties['hello'] = 'world'
    }
    return event
}
```
