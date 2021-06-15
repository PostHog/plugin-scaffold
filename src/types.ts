import { City } from '@maxmind/geoip2-node'

/** Input for a PostHog plugin. */
export type PluginInput = {
    config?: Record<string, any>
    attachments?: Record<string, PluginAttachment | undefined>
    global?: Record<string, any>
    jobs?: Record<string, JobOptions>
}

/** A PostHog plugin. */
export interface Plugin<Input extends PluginInput = {}> {
    /** Ran when the plugin is loaded by the PostHog plugin server. */
    setupPlugin?: (meta: Meta<Input>) => void
    /** Ran when the plugin is unloaded by the PostHog plugin server. */
    teardownPlugin?: (meta: Meta<Input>) => void
    /** Receive a single non-snapshot event and return it in its processed form. You can discard the event by returning null. */
    processEvent?: (event: PluginEvent, meta: Meta<Input>) => PluginEvent | null | Promise<PluginEvent | null>
    /** DEPRECATED: Receive a batch of events and return it in its processed form. You can discard events by not including them in the returned array. You can also append additional events to the returned array. */
    processEventBatch?: (eventBatch: PluginEvent[], meta: Meta<Input>) => PluginEvent[] | Promise<PluginEvent[]>
    /** Receive a single non-snapshot event.  */
    exportEvents?: (events: PluginEvent[], meta: Meta<Input>) => void | Promise<void>
    onEvent?: (event: PluginEvent, meta: Meta<Input>) => void | Promise<void>
    /** Receive a single snapshot (session recording) event. */
    onSnapshot?: (event: PluginEvent, meta: Meta<Input>) => void | Promise<void>
    /** Ran every minute, on the minute. */
    runEveryMinute?: (meta: Meta<Input>) => void
    /** Ran every hour, on the hour. */
    runEveryHour?: (meta: Meta<Input>) => void
    /** Ran every day, on midnight. */
    runEveryDay?: (meta: Meta<Input>) => void
    /** Asynchronous jobs that can be scheduled. */
    jobs?: {
        [K in keyof Meta<Input>['jobs']]: (
            opts: Parameters<Meta<Input>['jobs'][K]>[0],
            meta: Meta<Input>
        ) => void | Promise<void>
    }

    // used for type resolution only, does not exist
    __internalMeta?: Meta<Input>
}

export type PluginMeta<T> = T extends { __internalMeta?: infer M } ? M : never

export type Properties = Record<string, any>

export interface PluginEvent {
    distinct_id: string
    ip: string | null
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

interface BasePluginMeta {
    cache: CacheExtension
    storage: StorageExtension
    geoip: GeoIPExtension
    config: Record<string, any>
    global: Record<string, any>
    attachments: Record<string, PluginAttachment | undefined>
    jobs: Record<string, (opts: any) => JobControls>
}

type JobOptions = Record<string, any> | undefined

type JobControls = {
    runNow: () => Promise<void>
    runIn: (duration: number, unit: string) => Promise<void>
    runAt: (date: Date) => Promise<void>
}

type MetaJobsFromJobOptions<J extends Record<string, JobOptions>> = {
    [K in keyof J]: (opts: J[K]) => JobControls
}

export interface Meta<Input extends PluginInput = {}> extends BasePluginMeta {
    attachments: Input['attachments'] extends Record<string, PluginAttachment | undefined>
        ? Input['attachments']
        : Record<string, PluginAttachment | undefined>
    config: Input['config'] extends Record<string, any> ? Input['config'] : Record<string, any>
    global: Input['global'] extends Record<string, any> ? Input['global'] : Record<string, any>
    jobs: Input['jobs'] extends Record<string, JobOptions>
        ? MetaJobsFromJobOptions<Input['jobs']>
        : Record<string, (opts: any) => JobControls>
}

export interface PluginConfigStructure {
    key?: string
    name?: string
    default?: string
    hint?: string
    markdown?: string
    order?: number
    required?: boolean
    secret?: boolean
}

export interface PluginConfigDefault extends PluginConfigStructure {
    type?: 'string' | 'attachment'
}

export interface PluginConfigChoice extends PluginConfigStructure {
    type: 'choice'
    choices: string[]
}

export type PluginConfigSchema = PluginConfigDefault | PluginConfigChoice

/** Additional cache set/get options. */
export interface CacheOptions {
    /** Whether input should be JSON-stringified/parsed. */
    jsonSerialize?: boolean
}

export interface CacheExtension {
    set: (key: string, value: unknown, ttlSeconds?: number, options?: CacheOptions) => Promise<void>
    get: (key: string, defaultValue: unknown, options?: CacheOptions) => Promise<unknown>
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

export interface GeoIPExtension {
    locate: (ip: string) => Promise<City | null>
}
