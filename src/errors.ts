export class RetryError extends Error {
    /** Set by the system. */
    _attempt: number | undefined
    /** Set by the system. */
    _maxAttempts: number | undefined

    constructor(message?: string) {
        super(message)
        this.name = "RetryError"
    }

    get nameWithAttempts(): string {
        return this._attempt && this._maxAttempts ? `${this.name} (attempt ${this._attempt}/${this._maxAttempts})` : this.name
    }

    toString(): string {
        return this.message ? `${this.nameWithAttempts}: ${this.message}` : this.nameWithAttempts
    }
}
