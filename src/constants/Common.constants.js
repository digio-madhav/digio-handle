export const CommonConstants = {
    VERSION: "1",
    ENVIRONMENTS : {
        STAGE : "stage",
        SANDBOX : "sandbox",
        PRODUCTION : "production"
    },

    ENDPOINTS: {
        STAGE : "http://localhost:8080",
        SANDBOX : "https://ext.digio.in:444",
        PRODUCTION : "https://api.digio.in",
        BASE_URL: ""
    },

    EXCEPTIONS : {
        MISSING_CONSTRUCTOR_CONFIG : {
            message : "Digio constructor requires configuration options for initialization."
        },
        INVALID_ENVIRONMENT : {
            message : "Provided environment value is invalid."
        },
        INVALID_METHOD : {
            message : "Provided signing method value is invalid."
        },
        INVALID_DOCUMENT_ID : {
            message : "Provided document id is invalid."
        },
        INVALID_IDENTIFIER : {
            message : "Provided email id or mobile number is invalid."
        },
        INVALID_REDIRECT_URL : {
            message : "Provided redirect url string is invalid."
        },
        INVALID_ERROR_URL : {
            message : "Provided error url string is invalid."
        },
        INVALID_LOGO_URL : {
            message : "Provided logo url is invalid."
        },
        INVALID_CALLBACK_METHOD : {
            message : "Provided callback method is not a function or is invalid."
        },
        INVALID_IFRAME_INVOCATION : {
            message : "Provided iframe invocation value is invalid or not a boolean."
        },
        INVALID_REDIRECTION_APPROACH_INVOCATION : {
            message : "Provided redirection approach value is invalid or not a boolean."
        },
        INVALID_AUTH_TYPE : {
            message: "Provided auth type is invalid."
        }
    },

    VIDEO_STREAM_ENDPOINT: {
      MEET: "https://meet.digio.in/libs/lib-jitsi-meet.min.js",
      MEET_EXTERNAL: "https://meet.digio.in/external_api.js"
    },

    API_ENDPOINTS: {
        VALIDATE_REQUEST: "/external/client/validate_token/",
        REQUEST_VIDEOCHAT: "/external/client/videochat/user/request/",
        JOIN_VIDEO_CHAT: "/external/client/join_video_chat/request/",
        POLL_FOR_REQUEST: "/external/client/videochat/user/request/poll_for_agent/"
    },

    JITSI_CONSTANTS: {
        OPTIONS: {
            hosts: {
                bridge: 'jitsi-videobridge.meet.digio.in',
                domain: 'meet.digio.in',
                focus: 'focus.meet.digio.in',
                muc: 'conference.meet.digio.in'
            },
            bosh: 'https://meet.digio.in/http-bind',
            p2p: {
                enabled: true,
                stunServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:stun3.l.google.com:19302' },
                ],
                preferredCodec: 'H264',
            }
        },
        INIT_OPTIONS: {
            disableAudioLevels: true,
            desktopSharingChromeExtId: 'mbocklcggfhnbahlnepmldehdhpjfcjp',
            desktopSharingChromeDisabled: false,
            desktopSharingChromeSources: [ 'screen', 'window' ],
            desktopSharingChromeMinExtVersion: '0.1',
            desktopSharingFirefoxDisabled: true,
            enableAnalyticsLogging: false,
        },
        CONFERENCE_OPTIONS: {
            openBridgeChannel: true
        },
        LOCAL_TRACK_OPTIONS: {
            devices: ['audio', 'video'],
            aspectRatio: 4/3,
            disableSimulcast: false,
            resolution: 720,
            constraints: {
                video: {
                    height: {
                        ideal: 720,
                        max: 720,
                        min: 480
                    }
                },
                frameRate: {
                    ideal: 20,
                    max: 40,
                    min: 10
                }
            },
            minFps: 20,
            maxFps: 30,
            videoQuality: {
                maxBitratesVideo: {
                    H264: {
                        low: 200000,
                        standard: 700000,
                        high: 2500000
                    },
                    VP8 : {
                        low: 200000,
                        standard: 500000,
                        high: 1500000
                    },
                    VP9: {
                        low: 100000,
                        standard: 300000,
                        high: 1200000
                    }
                },
                minHeightForQualityLvl: {
                    360: 'standard',
                    720: 'high'
                },
            },
            facingMode : "user"
        }

    }
}