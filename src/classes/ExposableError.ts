class ExposableError extends Error {
    public name = "ExposableError";
    public code: string;
    public status: number;

    constructor(message: string, code: string, status: number) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

export default ExposableError;