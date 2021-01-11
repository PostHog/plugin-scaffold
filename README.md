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

## Questions?

### [Join our Slack community.](https://join.slack.com/t/posthogusers/shared_invite/enQtOTY0MzU5NjAwMDY3LTc2MWQ0OTZlNjhkODk3ZDI3NDVjMDE1YjgxY2I4ZjI4MzJhZmVmNjJkN2NmMGJmMzc2N2U3Yjc3ZjI5NGFlZDQ)
