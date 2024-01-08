import { City } from '@maxmind/geoip2-node'
import { Response, Headers} from 'node-fetch'

/** Input for a PostHog plugin. */
export type PluginInput = {
    config?: Record<string, any>
    attachments?: Record<string, PluginAttachment | undefined>
    global?: Record<string, any>
    /** @deprecated */
    jobs?: Record<string, JobOptions>
    /** @deprecated */
    metrics?: Record<string, AllowedMetricsOperations>
}

export interface Webhook {
    url: string
    body: string
    headers?: Record<string, string> // default: {}
    method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH' // default: 'POST'
}

/** A PostHog plugin. */
export interface Plugin<Input extends PluginInput = {}> {
    /** Ran when the plugin is loaded by the PostHog plugin server. */
    setupPlugin?: (meta: Meta<Input>) => void
    /** Ran when the plugin is unloaded by the PostHog plugin server. */
    teardownPlugin?: (meta: Meta<Input>) => void
    /** @deprecated */
    getSettings?: (meta: Meta<Input>) => PluginSettings
    /** Used for filtering events, return True to keep the event and False to drop it. */
    filterEvent?: (event: PostHogEvent, meta: Meta<Input>) => boolean
    /** Used for modifying events, return the updated event */
    modifyEvent?: (event: PostHogEvent, meta: Meta<Input>) => PostHogEvent
    /** @deprecated: use filterEvent or modifyEvent */
    processEvent?: (event: PluginEvent, meta: Meta<Input>) => PluginEvent | null | Promise<PluginEvent | null>
    /** @deprecated: use filterEvent or modifyEvent */
    processEventBatch?: (eventBatch: PluginEvent[], meta: Meta<Input>) => PluginEvent[] | Promise<PluginEvent[]>
    /** @deprecated: use composeWebhook */
    exportEvents?: (events: ProcessedPluginEvent[], meta: Meta<Input>) => void | Promise<void>
    /** @deprecated: use composeWebhook */
    onEvent?: (event: ProcessedPluginEvent, meta: Meta<Input>) => void | Promise<void>
    /** Used for exporting a single event */
    composeWebhook?: (event: PostHogEvent, meta: Meta<Input>) => Webhook | null
    /** @deprecated:  */
    runEveryMinute?: (meta: Meta<Input>) => void
    /** @deprecated:  */
    runEveryHour?: (meta: Meta<Input>) => void
    /** @deprecated:  */
    runEveryDay?: (meta: Meta<Input>) => void
    /** @deprecated */
    jobs?: {
        [K in keyof Meta<Input>['jobs']]: (
            opts: Parameters<Meta<Input>['jobs'][K]>[0],
            meta: Meta<Input>
        ) => void | Promise<void>
    }
    /** @deprecated */
    metrics?: {
        [K in keyof Meta<Input>['metrics']]: AllowedMetricsOperations
    }
    // used for type resolution only, does not exist
    __internalMeta?: Meta<Input>
}


export type PluginMeta<T> = T extends { __internalMeta?: infer M } ? M : never

export type Properties = Record<string, any>

type PostHogEventProperties = { '$elements_chain' : string, [id: string]: any };

/** We're moving to a single PostHogEvent model use this in any future apps/plugins 
*/
export interface PostHogEvent {
    /** The assigned UUIDT of the event. */
    uuid: string
    team_id: number
    distinct_id: string
    event: string
    timestamp: Date // in UTC timezone
    /** Optionally contains
     * $ip - for ip address, which will be removed later if project settings anonymize_ips is true
     * $set - for person properties to set
     * $set_once - for person properties to set if not already set
     * $elements_chain - for autocapture elements chain
     */
    properties: PostHogEventProperties
}


export interface PluginAttachment {
    content_type: string
    file_name: string
    contents: any
}

interface BasePluginMeta {
    // @deprecated
    cache: CacheExtension
    // @deprecated
    storage: StorageExtension
    // @deprecated
    geoip: GeoIPExtension
    config: Record<string, any>
    global: Record<string, any>
    attachments: Record<string, PluginAttachment | undefined>
    // @deprecated
    jobs: Record<string, (opts: any) => JobControls>
    // @deprecated
    metrics: Record<string, Partial<FullMetricsControls>>
    // @deprecated
    utils: UtilsExtension
}


export interface Meta<Input extends PluginInput = {}> extends BasePluginMeta {
    attachments: Input['attachments'] extends Record<string, PluginAttachment | undefined>
        ? Input['attachments']
        : Record<string, PluginAttachment | undefined>
    config: Input['config'] extends Record<string, any> ? Input['config'] : Record<string, any>
    global: Input['global'] extends Record<string, any> ? Input['global'] : Record<string, any>
    // @deprecated
    jobs: Input['jobs'] extends Record<string, JobOptions>
        ? MetaJobsFromJobOptions<Input['jobs']>
        : Record<string, (opts: any) => JobControls>
    // @deprecated
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

export interface ConsoleExtension {
    log: (...args: unknown[]) => void
    error: (...args: unknown[]) => void
    debug: (...args: unknown[]) => void
    info: (...args: unknown[]) => void
    warn: (...args: unknown[]) => void
}

// Not yet available
export interface PluginPerson {
    uuid: string
    team_id: number
    properties: Properties
    created_at: string
}

// *** EVERYTHING BELOW IS DEPRECATED ***

// @deprecated
export enum MetricsOperation {
    Sum = 'sum',
    Min = 'min',
    Max = 'max',
}

// @deprecated
export type AllowedMetricsOperations = MetricsOperation.Sum | MetricsOperation.Max | MetricsOperation.Min

// @deprecated
export type PluginSettings = {
    /** Experimental: 
    
        Some plugins incur high costs for small batches, e.g. S3. In these cases 
        we want to signal that the plugin would prefer larger batches. There are other
        plugins that may not be written to handle large batches, for these we will want 
        to keep batches small to not break their behaviour.
        
        Defaults to `false`.
    */
    handlesLargeBatches?: boolean
}

/** @deprecated: Use PostHogEvent.properties['$elements_chain'] */
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

/** @deprecated: Use PostHogEvent */
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
/** @deprecated: Use PostHogEvent */
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
    person?: PluginPerson
    /** We process `$elements` out of `properties`, so we want to make sure we
     * maintain this in the processed event that we pass to plugins */
    elements?: Element[]
}

// @deprecated
type JobOptions = Record<string, any> | undefined

// @deprecated
type JobControls = {
    runNow: () => Promise<void>
    runIn: (duration: number, unit: string) => Promise<void>
    runAt: (date: Date) => Promise<void>
}

// @deprecated
interface MetricsControlsIncrement {
    increment: (value: number) => Promise<void>
}

// @deprecated
interface MetricsControlsMax {
    max: (value: number) => Promise<void>
}

// @deprecated
interface MetricsControlsMin {
    min: (value: number) => Promise<void>
}

// @deprecated
type FullMetricsControls = MetricsControlsIncrement & MetricsControlsMax & MetricsControlsMin

// @deprecated
type MetricsControls<V> = V extends MetricsOperation.Sum
    ? MetricsControlsIncrement
    : V extends MetricsOperation.Max
    ? MetricsControlsMax
    : MetricsControlsMin

// @deprecated
type MetaMetricsFromMetricsOptions<J extends Record<string, string>> = {
    [K in keyof J]: MetricsControls<J[K]>
}

// @deprecated
type MetaJobsFromJobOptions<J extends Record<string, JobOptions>> = {
    [K in keyof J]: (opts: J[K]) => JobControls
}
// @deprecated
export interface CacheOptions {
    /** Whether input should be JSON-stringified/parsed. */
    jsonSerialize?: boolean
}

// @deprecated
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

// @deprecated
export interface StorageExtension {
    set: (key: string, value: unknown) => Promise<void>
    get: (key: string, defaultValue: unknown) => Promise<unknown>
    del: (key: string) => Promise<void>
}

// @deprecated
export interface GeoIPExtension {
    locate: (ip: string) => Promise<City | null>
}

// @deprecated
export interface UtilsExtension {
    cursor: CursorUtils
}

// @deprecated
export interface CursorUtils {
    init: (key: string, initialValue?: number) => Promise<void>
    increment: (key: string, incrementBy?: number) => Promise<number>
}

// @deprecated
interface ApiMethodOptions {
    headers?: Headers
    data?: Record<string, any>
    host?: string
    projectApiKey?: string
    personalApiKey?: string
}

// @deprecated
export interface ApiExtension {
    get(path: string, options?: ApiMethodOptions): Promise<Response>
    post(path: string, options?: ApiMethodOptions): Promise<Response>
    put(path: string, options?: ApiMethodOptions): Promise<Response>
    delete(path: string, options?: ApiMethodOptions): Promise<Response>
}

// @deprecated
export interface PostHogExtension {
    capture(event: string, properties?: Record<string, any>): Promise<void>
    api: ApiExtension
}
