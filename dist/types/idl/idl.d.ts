export declare const IDL: {
    version: string;
    name: string;
    instructions: ({
        accounts: {
            name: any;
            isMut: any;
            isSigner: any;
            pda: any;
            address: any;
        }[];
        name: string;
        discriminator: number[];
        args: never[];
        returns: {
            vec: string;
        };
    } | {
        accounts: {
            name: any;
            isMut: any;
            isSigner: any;
            pda: any;
            address: any;
        }[];
        name: string;
        discriminator: number[];
        args: {
            name: string;
            type: string;
        }[];
        returns?: undefined;
    } | {
        accounts: {
            name: any;
            isMut: any;
            isSigner: any;
            pda: any;
            address: any;
        }[];
        name: string;
        discriminator: number[];
        args: {
            name: string;
            type: string;
        }[];
        returns?: undefined;
    })[];
    accounts: {
        name: string;
        discriminator: number[];
    }[];
    events: {
        name: string;
        discriminator: number[];
    }[];
    errors: {
        code: number;
        name: string;
        msg: string;
    }[];
    types: ({
        name: string;
        type: {
            kind: string;
            fields: {
                name: string;
                type: {
                    vec: string;
                };
            }[];
        };
    } | {
        name: string;
        type: {
            kind: string;
            fields: ({
                name: string;
                type: string;
            } | {
                name: string;
                type: {
                    vec: {
                        defined: {
                            name: string;
                        };
                    };
                };
            })[];
        };
    })[];
};
