export class RetryError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = "RetryError"
    }
}
