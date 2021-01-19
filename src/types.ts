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
    /** Person properties update. */
    $set?: Properties
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
}

export interface PluginConfigSchema {
    key?: string
    name?: string
    type?: 'string' | 'attachment'
    default?: string
    hint?: string
    markdown?: string
    order?: number
    required?: boolean
}

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
