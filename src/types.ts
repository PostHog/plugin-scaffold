/** A PostHog plugin. */
export interface Plugin {
    /** Ran when the plugin is loaded by the PostHog plugin server. */
    setupPlugin?: (meta: PluginMeta) => void
    /** Receive a single event and return it in its processed form. You can discard the event by returning null. */
    processEvent?: (event: PluginEvent, meta: PluginMeta) => PluginEvent | null | Promise<PluginEvent | null>
    /** Receive a batch of events and return it in its processed form. You can discard events by not including them in the returned array. You can also append additional events to the returned array. */
    processEventBatch?: (eventBatch: PluginEvent[], meta: PluginMeta) => PluginEvent[] | Promise<PluginEvent[]>
    /** Ran every minute, on the minute. */
    runEveryMinute?: (meta: PluginMeta) => void
    /** Ran every hour, on the hour. */
    runEveryHour?: (meta: PluginMeta) => void
    /** Ran every day, on midnight. */
    runEveryDay?: (meta: PluginMeta) => void
}

export type Properties = Record<string, any>

export interface PluginEvent {
    distinct_id: string
    ip: string
    site_url: string
    team_id: number
    now: string
    event: string
    sent_at?: string
    properties?: Properties
    timestamp?: string
    offset?: number
    /** Person properties update (override). */
    $set?: Properties
    /** Person properties update (if not set). */
    $set_once?: Properties
    /** The offset of the Kafka message this event was passed in (EE pipeline-only). */
    kafka_offset?: string
    /** The assigned UUIDT of the event (EE pipeline-only). */
    uuid?: string
}

export interface PluginAttachment {
    content_type: string
    file_name: string
    contents: any
}

export interface PluginMeta {
    cache: CacheExtension
    storage: StorageExtension
    config: Record<string, any>
}

interface PluginConfigStructure {
    key?: string
    name?: string
    default?: string
    hint?: string
    markdown?: string
    order?: number
    required?: boolean
    secret?: boolean
}

interface PluginConfigDefault extends PluginConfigStructure {
    type?: 'string' | 'attachment'
} 

interface PluginConfigChoice extends PluginConfigStructure {
    type: 'choice'
    choices: string[]
}

export type PluginConfigSchema = PluginConfigDefault | PluginConfigChoice
export interface CacheExtension {
    set: (key: string, value: unknown, ttlSeconds?: number) => Promise<void>
    get: (key: string, defaultValue: unknown) => Promise<unknown>
    incr: (key: string) => Promise<number>
    expire: (key: string, ttlSeconds: number) => Promise<boolean>
}

export interface StorageExtension {
    set: (key: string, value: unknown) => Promise<void>
    get: (key: string, defaultValue: unknown) => Promise<unknown>
}

export interface ConsoleExtension {
    log: (...args: unknown[]) => void
    error: (...args: unknown[]) => void
    debug: (...args: unknown[]) => void
    info: (...args: unknown[]) => void
    warn: (...args: unknown[]) => void
}
