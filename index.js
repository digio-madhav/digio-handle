import JitsiConnection from "./src/helpers/jitsi.connection.service";
import {clientCustomService} from "./src/helpers/custom.service";
import {CommonConstants} from "./src/constants/Common.constants.js";

class DigioHandle {

    constructor(options) {
        this.init(options);
    }

    init = function (options) {
        if (!options) {
            throw "No Options Provided";
        }
        if (options.environment) {
            if (options.environment.toLowerCase() === CommonConstants.ENVIRONMENTS.STAGE.toLowerCase() || options.environment.toLowerCase() === CommonConstants.ENVIRONMENTS.SANDBOX.toLowerCase() || options.environment.toLowerCase() === CommonConstants.ENVIRONMENTS.PRODUCTION.toLowerCase()) {
                this.environment = options.environment;
            } else {
                throw "Provided environment is incorrect.Please refer documentation";
            }
        }

        if (options.callback) {
            if (typeof options.callback !== "function") {
                throw "Provided type is not a function";
            }
            this.callback = options.callback;
        } else {
            throw "Required callback function is not provided";
        }

        this.meeting = new JitsiConnection(options.callback);
        this.customService = clientCustomService.getInstance();
    };

    initialize = function (id, gatewayToken, identifier) {
        CommonConstants.ENDPOINTS.BASE_URL = CommonConstants.ENDPOINTS[this.environment];
        this.customService.validateDocumentId(id);
        this.customService.validateIdentifier(identifier);
        this.customService.validateSession(id, gatewayToken, identifier);
        this.requestId = id;
        this.identifier = identifier;
    };

    submit = function (type) {
        switch (type) {
            case "CALL_REQUEST":
                this.callRequest();
                break;
            case "REVERSE_CAMERA":
                this.meeting.switchCamera();
                break;
            default:
                break;
        }
    };

    cancel = function () {
        // Here will cancel the ongoing request for call
    }

    callRequest = function () {
        this.meeting.loadJITSI()
            .then((res) => {
                this.meeting.requestForCall(this.requestId)
                    .then((response) => {
                        this.meeting.callResponse(response);
                    })
                    .catch((error) => {
                        this.meeting.requestForCall(this.requestId)
                            .then((response) => {
                                this.meeting.callResponse(response);
                            })
                    })
            })
    }
}

export default TwoWayVideoHandle;