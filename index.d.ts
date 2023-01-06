export default class DigioHandle {
    constructor(options: any);
    initialize(id: string, gatewayToken: string, identifier: string): void;
    submit(type: string): void;
    cancel(): void;
}