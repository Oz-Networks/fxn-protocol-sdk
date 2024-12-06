/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/subscription_manager.json`.
 */
export type SubscriptionManager = {
  "address": "AnPhQYFcJEPBG2JTrvaNne85rXufC1Q97bu29YaWvKDs",
  "metadata": {
    "name": "subscriptionManager",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelSubscription",
      "discriminator": [
        60,
        139,
        189,
        242,
        191,
        208,
        143,
        18
      ],
      "accounts": [
        {
          "name": "subscriber",
          "writable": true,
          "signer": true
        },
        {
          "name": "dataProvider"
        },
        {
          "name": "subscription",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
                ]
              },
              {
                "kind": "account",
                "path": "subscriber"
              },
              {
                "kind": "account",
                "path": "dataProvider"
              }
            ]
          }
        },
        {
          "name": "qualityInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  97,
                  108,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "dataProvider"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "nftTokenAccount"
        }
      ],
      "args": [
        {
          "name": "quality",
          "type": "u8"
        }
      ]
    },
    {
      "name": "endSubscription",
      "discriminator": [
        115,
        160,
        25,
        55,
        34,
        94,
        144,
        150
      ],
      "accounts": [
        {
          "name": "subscriber",
          "writable": true,
          "signer": true
        },
        {
          "name": "dataProvider"
        },
        {
          "name": "subscription",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
                ]
              },
              {
                "kind": "account",
                "path": "subscriber"
              },
              {
                "kind": "account",
                "path": "dataProvider"
              }
            ]
          }
        },
        {
          "name": "qualityInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  97,
                  108,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "dataProvider"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "quality",
          "type": "u8"
        }
      ]
    },
    {
      "name": "getSubscribers",
      "discriminator": [
        232,
        209,
        197,
        223,
        218,
        152,
        141,
        210
      ],
      "accounts": [
        {
          "name": "dataProvider"
        },
        {
          "name": "subscribersList",
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
                ]
              },
              {
                "kind": "account",
                "path": "dataProvider"
              }
            ]
          }
        }
      ],
      "args": [],
      "returns": {
        "vec": "pubkey"
      }
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  111,
                  114,
                  97,
                  103,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeQualityInfo",
      "discriminator": [
        154,
        244,
        109,
        54,
        154,
        111,
        42,
        23
      ],
      "accounts": [
        {
          "name": "qualityInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  97,
                  108,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "dataProvider"
              }
            ]
          }
        },
        {
          "name": "dataProvider"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "renewSubscription",
      "discriminator": [
        45,
        75,
        154,
        194,
        160,
        10,
        111,
        183
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true
        },
        {
          "name": "subscriber",
          "writable": true,
          "signer": true
        },
        {
          "name": "dataProvider",
          "writable": true
        },
        {
          "name": "subscription",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
                ]
              },
              {
                "kind": "account",
                "path": "subscriber"
              },
              {
                "kind": "account",
                "path": "dataProvider"
              }
            ]
          }
        },
        {
          "name": "qualityInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  97,
                  108,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "dataProvider"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "nftTokenAccount"
        }
      ],
      "args": [
        {
          "name": "newRecipient",
          "type": "string"
        },
        {
          "name": "newEndTime",
          "type": "i64"
        },
        {
          "name": "quality",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setCollectorFee",
      "discriminator": [
        62,
        129,
        230,
        50,
        150,
        38,
        238,
        92
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setFeePerDay",
      "discriminator": [
        141,
        138,
        186,
        148,
        166,
        202,
        210,
        116
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "storeDataQuality",
      "discriminator": [
        109,
        123,
        36,
        195,
        189,
        91,
        208,
        129
      ],
      "accounts": [
        {
          "name": "subscriber",
          "writable": true,
          "signer": true
        },
        {
          "name": "dataProvider"
        },
        {
          "name": "qualityInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  97,
                  108,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "dataProvider"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "quality",
          "type": "u8"
        }
      ]
    },
    {
      "name": "subscribe",
      "discriminator": [
        254,
        28,
        191,
        138,
        156,
        179,
        183,
        53
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true
        },
        {
          "name": "subscriber",
          "writable": true,
          "signer": true
        },
        {
          "name": "dataProvider",
          "writable": true
        },
        {
          "name": "subscription",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
                ]
              },
              {
                "kind": "account",
                "path": "subscriber"
              },
              {
                "kind": "account",
                "path": "dataProvider"
              }
            ]
          }
        },
        {
          "name": "subscribersList",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
                ]
              },
              {
                "kind": "account",
                "path": "dataProvider"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "nftTokenAccount"
        }
      ],
      "args": [
        {
          "name": "recipient",
          "type": "string"
        },
        {
          "name": "endTime",
          "type": "i64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "qualityInfo",
      "discriminator": [
        59,
        207,
        119,
        53,
        151,
        101,
        159,
        114
      ]
    },
    {
      "name": "state",
      "discriminator": [
        216,
        146,
        107,
        94,
        104,
        75,
        182,
        177
      ]
    },
    {
      "name": "subscribersList",
      "discriminator": [
        85,
        14,
        165,
        202,
        229,
        174,
        22,
        69
      ]
    },
    {
      "name": "subscription",
      "discriminator": [
        64,
        7,
        26,
        135,
        102,
        132,
        98,
        33
      ]
    }
  ],
  "events": [
    {
      "name": "collectorFeeUpdatedEvent",
      "discriminator": [
        111,
        103,
        158,
        122,
        19,
        32,
        13,
        99
      ]
    },
    {
      "name": "feePerDayUpdatedEvent",
      "discriminator": [
        219,
        16,
        119,
        65,
        189,
        118,
        175,
        120
      ]
    },
    {
      "name": "qualityProvidedEvent",
      "discriminator": [
        65,
        215,
        185,
        198,
        187,
        33,
        124,
        150
      ]
    },
    {
      "name": "subscriptionCancelledEvent",
      "discriminator": [
        10,
        87,
        228,
        73,
        76,
        115,
        135,
        170
      ]
    },
    {
      "name": "subscriptionCreatedEvent",
      "discriminator": [
        247,
        246,
        115,
        176,
        253,
        84,
        244,
        155
      ]
    },
    {
      "name": "subscriptionEndedEvent",
      "discriminator": [
        65,
        132,
        208,
        62,
        46,
        117,
        222,
        111
      ]
    },
    {
      "name": "subscriptionRenewedEvent",
      "discriminator": [
        77,
        2,
        48,
        127,
        173,
        252,
        49,
        6
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "periodTooShort",
      "msg": "Subscription period is too short"
    },
    {
      "code": 6001,
      "name": "alreadySubscribed",
      "msg": "Already subscribed"
    },
    {
      "code": 6002,
      "name": "insufficientPayment",
      "msg": "Insufficient payment"
    },
    {
      "code": 6003,
      "name": "invalidNftHolder",
      "msg": "Invalid NFT holder"
    },
    {
      "code": 6004,
      "name": "subscriptionNotFound",
      "msg": "Subscription not found"
    },
    {
      "code": 6005,
      "name": "qualityOutOfRange",
      "msg": "Quality out of range"
    },
    {
      "code": 6006,
      "name": "subscriptionAlreadyEnded",
      "msg": "Subscription has already ended"
    },
    {
      "code": 6007,
      "name": "activeSubscription",
      "msg": "Subscription is still active"
    },
    {
      "code": 6008,
      "name": "notOwner",
      "msg": "Not the contract owner"
    }
  ],
  "types": [
    {
      "name": "collectorFeeUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newCollectorFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "feePerDayUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newFeePerDay",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "qualityInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subscriber",
            "type": "pubkey"
          },
          {
            "name": "quality",
            "type": "u8"
          },
          {
            "name": "currentIndex",
            "type": "u8"
          },
          {
            "name": "qualities",
            "type": {
              "vec": {
                "defined": {
                  "name": "qualityRecord"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "qualityProvidedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dataProvider",
            "type": "pubkey"
          },
          {
            "name": "subscriber",
            "type": "pubkey"
          },
          {
            "name": "quality",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "qualityRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "provider",
            "type": "pubkey"
          },
          {
            "name": "quality",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "state",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "nftProgramId",
            "type": "pubkey"
          },
          {
            "name": "feePerDay",
            "type": "u64"
          },
          {
            "name": "collectorFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "subscribersList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subscribers",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "subscription",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "recipient",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "subscriptionCancelledEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dataProvider",
            "type": "pubkey"
          },
          {
            "name": "subscriber",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "subscriptionCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dataProvider",
            "type": "pubkey"
          },
          {
            "name": "subscriber",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "string"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "subscriptionEndedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dataProvider",
            "type": "pubkey"
          },
          {
            "name": "subscriber",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "subscriptionRenewedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dataProvider",
            "type": "pubkey"
          },
          {
            "name": "subscriber",
            "type": "pubkey"
          },
          {
            "name": "newRecipient",
            "type": "string"
          },
          {
            "name": "newEndTime",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
