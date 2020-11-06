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

export interface PluginMeta {
    team: number | string,
    order: number,
    name: string,
    tag: string | null,
    config: Record<string, any>,
    attachments: Record<string, MetaAttachment>
}

export interface MetaAttachment {
    content_type: string
    file_name: string
    contents: any
}
