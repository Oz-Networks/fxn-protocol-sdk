/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/subscription_manager.json`.
 */
export type SubscriptionManager = {
    "address": "7boH3jGFc58ji5uwZCaJJiRbDUmLkGpToCEcj9xUKrRM";
    "metadata": {
        "name": "subscriptionManager";
        "version": "0.1.0";
        "spec": "0.1.0";
        "description": "Created with Anchor";
    };
    "instructions": [
        {
            "name": "addSubscriptionsLists";
            "discriminator": [
                75,
                92,
                81,
                46,
                141,
                174,
                174,
                37
            ];
            "accounts": [
                {
                    "name": "subscriber";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "dataProvider";
                    "writable": true;
                },
                {
                    "name": "mySubscriptions";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    109,
                                    121,
                                    95,
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    112,
                                    116,
                                    105,
                                    111,
                                    110,
                                    115
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "subscriber";
                            }
                        ];
                    };
                },
                {
                    "name": "subscribersList";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    98,
                                    101,
                                    114,
                                    115
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [];
        },
        {
            "name": "approveRequest";
            "discriminator": [
                89,
                68,
                167,
                104,
                93,
                25,
                178,
                205
            ];
            "accounts": [
                {
                    "name": "subscriber";
                    "writable": true;
                },
                {
                    "name": "dataProvider";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "subscriptionRequests";
                    "writable": true;
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [
                {
                    "name": "index";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "cancelSubscription";
            "discriminator": [
                60,
                139,
                189,
                242,
                191,
                208,
                143,
                18
            ];
            "accounts": [
                {
                    "name": "subscriber";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "dataProvider";
                },
                {
                    "name": "subscription";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    112,
                                    116,
                                    105,
                                    111,
                                    110
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "subscriber";
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "qualityInfo";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    113,
                                    117,
                                    97,
                                    108,
                                    105,
                                    116,
                                    121
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                }
            ];
            "args": [
                {
                    "name": "quality";
                    "type": "u8";
                }
            ];
        },
        {
            "name": "closeSubscriptionAccount";
            "discriminator": [
                39,
                224,
                172,
                178,
                37,
                9,
                186,
                82
            ];
            "accounts": [
                {
                    "name": "subscriber";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "dataProvider";
                },
                {
                    "name": "subscription";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    112,
                                    116,
                                    105,
                                    111,
                                    110
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "subscriber";
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                }
            ];
            "args": [];
        },
        {
            "name": "editAgentData";
            "discriminator": [
                108,
                105,
                209,
                37,
                34,
                29,
                170,
                139
            ];
            "accounts": [
                {
                    "name": "agentRegistration";
                    "writable": true;
                },
                {
                    "name": "dataProviderFee";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    100,
                                    97,
                                    116,
                                    97,
                                    95,
                                    112,
                                    114,
                                    111,
                                    118,
                                    105,
                                    100,
                                    101,
                                    114,
                                    95,
                                    102,
                                    101,
                                    101
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "dataProvider";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [
                {
                    "name": "name";
                    "type": "string";
                },
                {
                    "name": "description";
                    "type": "string";
                },
                {
                    "name": "restrictSubscriptions";
                    "type": "bool";
                },
                {
                    "name": "capabilities";
                    "type": {
                        "vec": "string";
                    };
                },
                {
                    "name": "fee";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "endSubscription";
            "discriminator": [
                115,
                160,
                25,
                55,
                34,
                94,
                144,
                150
            ];
            "accounts": [
                {
                    "name": "subscriber";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "dataProvider";
                },
                {
                    "name": "subscription";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    112,
                                    116,
                                    105,
                                    111,
                                    110
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "subscriber";
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "qualityInfo";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    113,
                                    117,
                                    97,
                                    108,
                                    105,
                                    116,
                                    121
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                }
            ];
            "args": [
                {
                    "name": "quality";
                    "type": "u8";
                }
            ];
        },
        {
            "name": "getSubscribers";
            "discriminator": [
                232,
                209,
                197,
                223,
                218,
                152,
                141,
                210
            ];
            "accounts": [
                {
                    "name": "dataProvider";
                },
                {
                    "name": "subscribersList";
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    98,
                                    101,
                                    114,
                                    115
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                }
            ];
            "args": [];
            "returns": {
                "vec": "pubkey";
            };
        },
        {
            "name": "initMySubscriptionsList";
            "discriminator": [
                16,
                123,
                17,
                204,
                44,
                17,
                112,
                202
            ];
            "accounts": [
                {
                    "name": "subscriber";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "dataProvider";
                    "writable": true;
                },
                {
                    "name": "mySubscriptions";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    109,
                                    121,
                                    95,
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    112,
                                    116,
                                    105,
                                    111,
                                    110,
                                    115
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "subscriber";
                            }
                        ];
                    };
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [];
        },
        {
            "name": "initSubscribersList";
            "discriminator": [
                125,
                114,
                126,
                189,
                97,
                188,
                11,
                29
            ];
            "accounts": [
                {
                    "name": "subscriber";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "dataProvider";
                    "writable": true;
                },
                {
                    "name": "subscribersList";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    98,
                                    101,
                                    114,
                                    115
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [];
        },
        {
            "name": "initialize";
            "discriminator": [
                175,
                175,
                109,
                31,
                13,
                152,
                155,
                237
            ];
            "accounts": [
                {
                    "name": "state";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    116,
                                    97,
                                    116,
                                    101,
                                    32,
                                    115,
                                    116,
                                    111,
                                    114,
                                    97,
                                    103,
                                    101
                                ];
                            }
                        ];
                    };
                },
                {
                    "name": "owner";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "nftProgram";
                },
                {
                    "name": "paymentSplToken";
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [];
        },
        {
            "name": "initializeQualityInfo";
            "discriminator": [
                154,
                244,
                109,
                54,
                154,
                111,
                42,
                23
            ];
            "accounts": [
                {
                    "name": "qualityInfo";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    113,
                                    117,
                                    97,
                                    108,
                                    105,
                                    116,
                                    121
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "dataProvider";
                },
                {
                    "name": "payer";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [];
        },
        {
            "name": "reallocAddSubscriptionsLists";
            "discriminator": [
                99,
                160,
                45,
                253,
                23,
                118,
                22,
                205
            ];
            "accounts": [
                {
                    "name": "subscriber";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "dataProvider";
                    "writable": true;
                },
                {
                    "name": "mySubscriptions";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    109,
                                    121,
                                    95,
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    112,
                                    116,
                                    105,
                                    111,
                                    110,
                                    115
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "subscriber";
                            }
                        ];
                    };
                },
                {
                    "name": "subscribersList";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    98,
                                    101,
                                    114,
                                    115
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [];
        },
        {
            "name": "registerAgent";
            "discriminator": [
                135,
                157,
                66,
                195,
                2,
                113,
                175,
                30
            ];
            "accounts": [
                {
                    "name": "agentRegistration";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    97,
                                    103,
                                    101,
                                    110,
                                    116,
                                    95,
                                    112,
                                    114,
                                    111,
                                    102,
                                    105,
                                    108,
                                    101,
                                    95,
                                    114,
                                    101,
                                    103,
                                    105,
                                    115,
                                    116,
                                    114,
                                    97,
                                    116,
                                    105,
                                    111,
                                    110
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "subscriptionRequests";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    112,
                                    116,
                                    105,
                                    111,
                                    110,
                                    95,
                                    114,
                                    101,
                                    113,
                                    117,
                                    101,
                                    115,
                                    116,
                                    115
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "dataProviderFee";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    100,
                                    97,
                                    116,
                                    97,
                                    95,
                                    112,
                                    114,
                                    111,
                                    118,
                                    105,
                                    100,
                                    101,
                                    114,
                                    95,
                                    102,
                                    101,
                                    101
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "dataProviderPaymentAta";
                    "writable": true;
                },
                {
                    "name": "dataProvider";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "tokenProgram";
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                },
                {
                    "name": "tokenMintAccount";
                    "writable": true;
                },
                {
                    "name": "state";
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [
                {
                    "name": "name";
                    "type": "string";
                },
                {
                    "name": "description";
                    "type": "string";
                },
                {
                    "name": "restrictSubscriptions";
                    "type": "bool";
                },
                {
                    "name": "capabilities";
                    "type": {
                        "vec": "string";
                    };
                },
                {
                    "name": "fee";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "renewSubscription";
            "discriminator": [
                45,
                75,
                154,
                194,
                160,
                10,
                111,
                183
            ];
            "accounts": [
                {
                    "name": "state";
                    "writable": true;
                },
                {
                    "name": "subscriber";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "dataProvider";
                    "writable": true;
                },
                {
                    "name": "subscription";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    112,
                                    116,
                                    105,
                                    111,
                                    110
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "subscriber";
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "qualityInfo";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    113,
                                    117,
                                    97,
                                    108,
                                    105,
                                    116,
                                    121
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "owner";
                    "writable": true;
                },
                {
                    "name": "dataProviderPaymentAta";
                },
                {
                    "name": "subscriberPaymentAta";
                    "writable": true;
                },
                {
                    "name": "ownerPaymentAta";
                    "writable": true;
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                },
                {
                    "name": "tokenProgram";
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                },
                {
                    "name": "dpFeeAccount";
                }
            ];
            "args": [
                {
                    "name": "newRecipient";
                    "type": "string";
                },
                {
                    "name": "newEndTime";
                    "type": "i64";
                },
                {
                    "name": "quality";
                    "type": "u8";
                }
            ];
        },
        {
            "name": "requestSubscription";
            "discriminator": [
                137,
                154,
                227,
                71,
                69,
                159,
                134,
                178
            ];
            "accounts": [
                {
                    "name": "subscriber";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "dataProvider";
                    "writable": true;
                },
                {
                    "name": "subscriptionRequests";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    112,
                                    116,
                                    105,
                                    111,
                                    110,
                                    95,
                                    114,
                                    101,
                                    113,
                                    117,
                                    101,
                                    115,
                                    116,
                                    115
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [];
        },
        {
            "name": "setCollectorFee";
            "discriminator": [
                62,
                129,
                230,
                50,
                150,
                38,
                238,
                92
            ];
            "accounts": [
                {
                    "name": "state";
                    "writable": true;
                },
                {
                    "name": "owner";
                    "signer": true;
                }
            ];
            "args": [
                {
                    "name": "newFee";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "setDataProviderFee";
            "discriminator": [
                211,
                248,
                5,
                80,
                147,
                98,
                135,
                148
            ];
            "accounts": [
                {
                    "name": "dataProviderFee";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    100,
                                    97,
                                    116,
                                    97,
                                    95,
                                    112,
                                    114,
                                    111,
                                    118,
                                    105,
                                    100,
                                    101,
                                    114,
                                    95,
                                    102,
                                    101,
                                    101
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "dataProvider";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                }
            ];
            "args": [
                {
                    "name": "fee";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "setFeePerDay";
            "discriminator": [
                141,
                138,
                186,
                148,
                166,
                202,
                210,
                116
            ];
            "accounts": [
                {
                    "name": "state";
                    "writable": true;
                },
                {
                    "name": "owner";
                    "signer": true;
                }
            ];
            "args": [
                {
                    "name": "newFee";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "storeDataQuality";
            "discriminator": [
                109,
                123,
                36,
                195,
                189,
                91,
                208,
                129
            ];
            "accounts": [
                {
                    "name": "subscriber";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "dataProvider";
                },
                {
                    "name": "qualityInfo";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    113,
                                    117,
                                    97,
                                    108,
                                    105,
                                    116,
                                    121
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                }
            ];
            "args": [
                {
                    "name": "quality";
                    "type": "u8";
                }
            ];
        },
        {
            "name": "subscribe";
            "discriminator": [
                254,
                28,
                191,
                138,
                156,
                179,
                183,
                53
            ];
            "accounts": [
                {
                    "name": "state";
                    "writable": true;
                },
                {
                    "name": "subscriber";
                    "writable": true;
                    "signer": true;
                },
                {
                    "name": "dataProvider";
                    "writable": true;
                },
                {
                    "name": "subscription";
                    "writable": true;
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const";
                                "value": [
                                    115,
                                    117,
                                    98,
                                    115,
                                    99,
                                    114,
                                    105,
                                    112,
                                    116,
                                    105,
                                    111,
                                    110
                                ];
                            },
                            {
                                "kind": "account";
                                "path": "subscriber";
                            },
                            {
                                "kind": "account";
                                "path": "dataProvider";
                            }
                        ];
                    };
                },
                {
                    "name": "owner";
                    "writable": true;
                },
                {
                    "name": "dataProviderPaymentAta";
                    "writable": true;
                },
                {
                    "name": "subscriberPaymentAta";
                    "writable": true;
                },
                {
                    "name": "ownerPaymentAta";
                    "writable": true;
                },
                {
                    "name": "agentRegistration";
                    "writable": true;
                },
                {
                    "name": "subscriptionRequests";
                    "writable": true;
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                },
                {
                    "name": "tokenProgram";
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                },
                {
                    "name": "dpFeeAccount";
                }
            ];
            "args": [
                {
                    "name": "recipient";
                    "type": "string";
                },
                {
                    "name": "endTime";
                    "type": "i64";
                }
            ];
        }
    ];
    "accounts": [
        {
            "name": "agentRegistration";
            "discriminator": [
                130,
                53,
                100,
                103,
                121,
                77,
                148,
                19
            ];
        },
        {
            "name": "dataProviderFee";
            "discriminator": [
                150,
                246,
                242,
                181,
                157,
                243,
                172,
                176
            ];
        },
        {
            "name": "mySubscriptions";
            "discriminator": [
                180,
                231,
                40,
                166,
                107,
                41,
                82,
                49
            ];
        },
        {
            "name": "qualityInfo";
            "discriminator": [
                59,
                207,
                119,
                53,
                151,
                101,
                159,
                114
            ];
        },
        {
            "name": "state";
            "discriminator": [
                216,
                146,
                107,
                94,
                104,
                75,
                182,
                177
            ];
        },
        {
            "name": "subscribersList";
            "discriminator": [
                85,
                14,
                165,
                202,
                229,
                174,
                22,
                69
            ];
        },
        {
            "name": "subscription";
            "discriminator": [
                64,
                7,
                26,
                135,
                102,
                132,
                98,
                33
            ];
        },
        {
            "name": "subscriptionRequests";
            "discriminator": [
                233,
                49,
                14,
                197,
                190,
                232,
                137,
                135
            ];
        }
    ];
    "events": [
        {
            "name": "collectorFeeUpdatedEvent";
            "discriminator": [
                111,
                103,
                158,
                122,
                19,
                32,
                13,
                99
            ];
        },
        {
            "name": "feePerDayUpdatedEvent";
            "discriminator": [
                219,
                16,
                119,
                65,
                189,
                118,
                175,
                120
            ];
        },
        {
            "name": "qualityProvidedEvent";
            "discriminator": [
                65,
                215,
                185,
                198,
                187,
                33,
                124,
                150
            ];
        },
        {
            "name": "subscriptionCancelledEvent";
            "discriminator": [
                10,
                87,
                228,
                73,
                76,
                115,
                135,
                170
            ];
        },
        {
            "name": "subscriptionCreatedEvent";
            "discriminator": [
                247,
                246,
                115,
                176,
                253,
                84,
                244,
                155
            ];
        },
        {
            "name": "subscriptionEndedEvent";
            "discriminator": [
                65,
                132,
                208,
                62,
                46,
                117,
                222,
                111
            ];
        },
        {
            "name": "subscriptionRenewedEvent";
            "discriminator": [
                77,
                2,
                48,
                127,
                173,
                252,
                49,
                6
            ];
        }
    ];
    "errors": [
        {
            "code": 6000;
            "name": "periodTooShort";
            "msg": "Subscription period is too short";
        },
        {
            "code": 6001;
            "name": "alreadySubscribed";
            "msg": "Already subscribed";
        },
        {
            "code": 6002;
            "name": "insufficientPayment";
            "msg": "Insufficient payment";
        },
        {
            "code": 6003;
            "name": "invalidTokenAccount";
            "msg": "Invalid Token Account";
        },
        {
            "code": 6004;
            "name": "subscriptionNotFound";
            "msg": "Subscription not found";
        },
        {
            "code": 6005;
            "name": "qualityOutOfRange";
            "msg": "Quality out of range";
        },
        {
            "code": 6006;
            "name": "subscriptionAlreadyEnded";
            "msg": "Subscription has already ended";
        },
        {
            "code": 6007;
            "name": "activeSubscription";
            "msg": "Subscription is still active";
        },
        {
            "code": 6008;
            "name": "notOwner";
            "msg": "Not the contract owner";
        },
        {
            "code": 6009;
            "name": "tooManyRequests";
            "msg": "Too Many Requests";
        },
        {
            "code": 6010;
            "name": "noSubscriptionRequest";
            "msg": "No Subscription Request Found";
        },
        {
            "code": 6011;
            "name": "requestNotApproved";
            "msg": "Request Not Approved";
        },
        {
            "code": 6012;
            "name": "unauthorized";
            "msg": "unauthorized";
        },
        {
            "code": 6013;
            "name": "invalidDataProvider";
            "msg": "Invalid Data Provider";
        },
        {
            "code": 6014;
            "name": "invalidDataProviderFeeAccount";
            "msg": "Invalid Data Provider Fee Account";
        },
        {
            "code": 6015;
            "name": "invalidOwnerFeeAccount";
            "msg": "Invalid Owner Fee Account";
        },
        {
            "code": 6016;
            "name": "invalidDataProviderPaymentAccount";
            "msg": "Invalid Data Provider Payment Account";
        },
        {
            "code": 6017;
            "name": "invalidOwnerPaymentAccount";
            "msg": "Invalid Owner Payment Account";
        },
        {
            "code": 6018;
            "name": "tooManySubscriptions";
            "msg": "Too Many Subscriptions";
        },
        {
            "code": 6019;
            "name": "tooManySubscribers";
            "msg": "Too Many Subscribers";
        },
        {
            "code": 6020;
            "name": "invalidIndex";
            "msg": "Invalid index";
        },
        {
            "code": 6021;
            "name": "alreadyApproved";
            "msg": "Already approved";
        },
        {
            "code": 6022;
            "name": "invalidSubscriber";
            "msg": "Invalid subscriber";
        }
    ];
    "types": [
        {
            "name": "agentRegistration";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "address";
                        "type": "pubkey";
                    },
                    {
                        "name": "name";
                        "type": "string";
                    },
                    {
                        "name": "description";
                        "type": "string";
                    },
                    {
                        "name": "restrictSubscriptions";
                        "type": "bool";
                    },
                    {
                        "name": "capabilities";
                        "type": {
                            "vec": "string";
                        };
                    }
                ];
            };
        },
        {
            "name": "collectorFeeUpdatedEvent";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "newCollectorFee";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "dataProviderFee";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "owner";
                        "type": "pubkey";
                    },
                    {
                        "name": "fee";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "feePerDayUpdatedEvent";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "newFeePerDay";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "mySubscriptions";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "providers";
                        "type": {
                            "vec": "pubkey";
                        };
                    }
                ];
            };
        },
        {
            "name": "qualityInfo";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "subscriber";
                        "type": "pubkey";
                    },
                    {
                        "name": "quality";
                        "type": "u8";
                    },
                    {
                        "name": "currentIndex";
                        "type": "u8";
                    },
                    {
                        "name": "qualities";
                        "type": {
                            "vec": {
                                "defined": {
                                    "name": "qualityRecord";
                                };
                            };
                        };
                    }
                ];
            };
        },
        {
            "name": "qualityProvidedEvent";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "dataProvider";
                        "type": "pubkey";
                    },
                    {
                        "name": "subscriber";
                        "type": "pubkey";
                    },
                    {
                        "name": "quality";
                        "type": "u8";
                    }
                ];
            };
        },
        {
            "name": "qualityRecord";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "provider";
                        "type": "pubkey";
                    },
                    {
                        "name": "quality";
                        "type": "u8";
                    }
                ];
            };
        },
        {
            "name": "requests";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "subscriberPubkey";
                        "type": "pubkey";
                    },
                    {
                        "name": "approved";
                        "type": "bool";
                    }
                ];
            };
        },
        {
            "name": "state";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "owner";
                        "type": "pubkey";
                    },
                    {
                        "name": "nftProgramId";
                        "type": "pubkey";
                    },
                    {
                        "name": "paymentSplToken";
                        "type": "pubkey";
                    },
                    {
                        "name": "feePerDay";
                        "type": "u64";
                    },
                    {
                        "name": "collectorFee";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "subscribersList";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "subscribers";
                        "type": {
                            "vec": "pubkey";
                        };
                    }
                ];
            };
        },
        {
            "name": "subscription";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "endTime";
                        "type": "i64";
                    },
                    {
                        "name": "recipient";
                        "type": "string";
                    }
                ];
            };
        },
        {
            "name": "subscriptionCancelledEvent";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "dataProvider";
                        "type": "pubkey";
                    },
                    {
                        "name": "subscriber";
                        "type": "pubkey";
                    }
                ];
            };
        },
        {
            "name": "subscriptionCreatedEvent";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "dataProvider";
                        "type": "pubkey";
                    },
                    {
                        "name": "subscriber";
                        "type": "pubkey";
                    },
                    {
                        "name": "recipient";
                        "type": "string";
                    },
                    {
                        "name": "endTime";
                        "type": "i64";
                    },
                    {
                        "name": "timestamp";
                        "type": "i64";
                    }
                ];
            };
        },
        {
            "name": "subscriptionEndedEvent";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "dataProvider";
                        "type": "pubkey";
                    },
                    {
                        "name": "subscriber";
                        "type": "pubkey";
                    }
                ];
            };
        },
        {
            "name": "subscriptionRenewedEvent";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "dataProvider";
                        "type": "pubkey";
                    },
                    {
                        "name": "subscriber";
                        "type": "pubkey";
                    },
                    {
                        "name": "newRecipient";
                        "type": "string";
                    },
                    {
                        "name": "newEndTime";
                        "type": "i64";
                    },
                    {
                        "name": "timestamp";
                        "type": "i64";
                    }
                ];
            };
        },
        {
            "name": "subscriptionRequests";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "requests";
                        "type": {
                            "vec": {
                                "defined": {
                                    "name": "requests";
                                };
                            };
                        };
                    }
                ];
            };
        }
    ];
};
