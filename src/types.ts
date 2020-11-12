export interface PluginEvent {
    distinct_id: string
    ip: string
    site_url: string
    team_id: number
    now: string
    event: string
    sent_at?: string
    properties?: Record<string, any>
}

export interface PluginAttachment {
    content_type: string
    file_name: string
    contents: any
}

export interface PluginMeta {
    cache: CacheExtension
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
    set: (key: string, value: unknown) => void
    get: (key: string, defaultValue: unknown) => Promise<unknown>
}

export interface ConsoleExtension {
    log: (...args: unknown[]) => void
    error: (...args: unknown[]) => void
    debug: (...args: unknown[]) => void
}
