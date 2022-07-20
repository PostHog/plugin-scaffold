import { City } from '@maxmind/geoip2-node'
import { Response } from 'node-fetch'

/** Input for a PostHog plugin. */
export type PluginInput = {
    config?: Record<string, any>
    attachments?: Record<string, PluginAttachment | undefined>
    global?: Record<string, any>
    jobs?: Record<string, JobOptions>
    metrics?: Record<string, AllowedMetricsOperations>
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
    /** Receive a single processed event. */
    onEvent?: (event: ProcessedPluginEvent, meta: Meta<Input>) => void | Promise<void>
    /** Receive a single snapshot (session recording) event. */
    onSnapshot?: (event: ProcessedPluginEvent, meta: Meta<Input>) => void | Promise<void>
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
    /** Metrics about plugin performance that can be set by plugin devs */
    metrics?: {
        [K in keyof Meta<Input>['metrics']]: AllowedMetricsOperations
    }
    // used for type resolution only, does not exist
    __internalMeta?: Meta<Input>
}

export enum MetricsOperation {
    Sum = 'sum',
    Min = 'min',
    Max = 'max'
}

export type AllowedMetricsOperations = MetricsOperation.Sum | MetricsOperation.Max | MetricsOperation.Min

export type PluginMeta<T> = T extends { __internalMeta?: infer M } ? M : never

export type Properties = Record<string, any>

/** Usable Element model. */
export interface Element {
    text?: string
    tag_name?: string
    href?: string
    attr_id?: string
    attr_class?: string[]
    nth_child?: number
    nth_of_type?: number
    attributes?: Record<string, any>
    event_id?: number
    order?: number
    group_id?: number
}

/** Raw event received by PostHog ingestion pipeline */
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
    /** The assigned UUIDT of the event. */
    uuid: string
    /** Person associated with the original distinct ID of the event. */
    person?: PluginPerson
}

/** Event after being processed by PostHog ingestion pipeline. */
export interface ProcessedPluginEvent {
    distinct_id: string
    ip: string | null
    team_id: number
    event: string
    properties: Properties
    timestamp: string
    /** Person properties update (override). */
    $set?: Properties
    /** Person properties update (if not set). */
    $set_once?: Properties
    /** The assigned UUIDT of the event. */
    uuid: string
    /** Person associated with the original distinct ID of the event. */
    person: PluginPerson
    /** We process `$elements` out of `properties`, so we want to make sure we
     * maintain this in the processed event that we pass to plugins */
    elements?: Element[]
}

/** Person exposed to the plugin. */
export interface PluginPerson {
    uuid: string
    team_id: number
    properties: Properties
    created_at: string
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
    metrics: Record<string, Partial<FullMetricsControls>>
    utils: UtilsExtension
}

type JobOptions = Record<string, any> | undefined

type JobControls = {
    runNow: () => Promise<void>
    runIn: (duration: number, unit: string) => Promise<void>
    runAt: (date: Date) => Promise<void>
}

interface MetricsControlsIncrement {
    increment: (value: number) => Promise<void>
}

interface MetricsControlsMax {
    max: (value: number) => Promise<void>
}

interface MetricsControlsMin {
    min: (value: number) => Promise<void>
}

type FullMetricsControls = MetricsControlsIncrement & MetricsControlsMax & MetricsControlsMin

type MetricsControls<V> = V extends MetricsOperation.Sum ? MetricsControlsIncrement : 
    V extends MetricsOperation.Max ? MetricsControlsMax 
    : MetricsControlsMin

type MetaMetricsFromMetricsOptions<J extends Record<string, string>> = {
    [K in keyof J]: MetricsControls<J[K]>
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
    metrics: Input['metrics'] extends Record<string, AllowedMetricsOperations>
        ? MetaMetricsFromMetricsOptions<Input['metrics']>
        : Record<string, FullMetricsControls>
}

type ConfigDependencyArrayValue = string | undefined
type ConfigDependencySubArray = ConfigDependencyArrayValue[]
type ConfigDependencyArray = ConfigDependencySubArray[]
export interface PluginConfigStructure {
    key?: string
    name?: string
    default?: string
    hint?: string
    markdown?: string
    order?: number
    required?: boolean
    secret?: boolean
    required_if?: ConfigDependencyArray
    visible_if?: ConfigDependencyArray
}

export interface PluginConfigDefault extends PluginConfigStructure {
    type?: 'string' | 'json' | 'attachment'
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
    lpush: (key: string, elementOrArray: unknown[]) => Promise<number>
    lrange: (key: string, startIndex: number, endIndex: number) => Promise<string[]>
    llen: (key: string) => Promise<number>
    lpop: (key: string, count: number) => Promise<string[]>
    lrem: (key: string, count: number, elementKey: string) => Promise<number>
}

export interface StorageExtension {
    set: (key: string, value: unknown) => Promise<void>
    get: (key: string, defaultValue: unknown) => Promise<unknown>
    del: (key: string) => Promise<void>
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

export interface UtilsExtension {
    cursor: CursorUtils
}

export interface CursorUtils {
    init: (key: string, initialValue?: number) => Promise<void>
    increment: (key: string, incrementBy?: number) => Promise<number>
}

/** NB: The following should replace types in plugin-server/src/worker/vm/extensions/api.ts */

interface ApiMethodOptions {
    headers?: Headers
    data?: Record<string, any>
    host?: string
    projectApiKey?: string
    personalApiKey?: string
}

export interface ApiExtension {
    get(path: string, options?: ApiMethodOptions): Promise<Response>
    post(path: string, options?: ApiMethodOptions): Promise<Response>
    put(path: string, options?: ApiMethodOptions): Promise<Response>
    delete(path: string, options?: ApiMethodOptions): Promise<Response>
}

/** NB: The following should replace DummyPostHog in plugin-server/src/worker/vm/extensions/posthog.ts */

export interface PostHogExtension {
    capture(event: string, properties?: Record<string, any>): Promise<void>
    api: ApiExtension
}
