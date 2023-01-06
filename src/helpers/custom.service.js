import {apiCall} from "./http.service";
import {CommonConstants} from "../constants/Common.constants";

export const clientCustomService = {
    customService : new CustomService(),
    getInstance: () => {
        return clientCustomService.customService;
    }
}

function CustomService() {
    this.sessionInfo = undefined;

    this.validateSession = function (requestId, tokenId, identifier) {

        const payload = {
            identifier: identifier,
            token: tokenId,
            entity_id: requestId
        }

        apiCall(CommonConstants.ENDPOINTS.BASE_URL + CommonConstants.API_ENDPOINTS.VALIDATE_REQUEST, null, payload, "POST")
            .then((response) => {
                if(response && response.response && response.session) {
                    sessionStorage.setItem("sessionId", response.session["sid"]);
                    this.sessionInfo = response.session;
                }
            })
            .catch((error) => {
                console.log("Here is the response received", error);
            })
    }

    this.validateDocumentId = function (docId) {
        if(!docId){
            throw new this.DigioException(CommonConstants.EXCEPTIONS.INVALID_DOCUMENT_ID+" : Id Missing");
        }
        if(Array.isArray(docId)){
            if(docId.length===0){
                throw new this.DigioException(CommonConstants.EXCEPTIONS.INVALID_DOCUMENT_ID+ " : Array Is Empty");
            }
            else{
                for(let i = 0; i < docId.length; i++){
                    if(!docId[i]){
                        throw new this.DigioException(CommonConstants.EXCEPTIONS.INVALID_DOCUMENT_ID+ " : At Array Index = "+i);
                    }
                }
            }
        }
    }

    this.validateIdentifier = function (identifier) {
        if(!identifier){
            throw new this.DigioException(CommonConstants.EXCEPTIONS.INVALID_IDENTIFIER);
        }
    }

    this.DigioException = function (err) {
        this.message = err.message;
        this.name = "DigioException";
    }

    this.DigioException.prototype.toString = function() {
        return this.name + ': "' + this.message + '"';
    };

    this.detectIE = function() {
        const ua = window.navigator.userAgent,
            msie = ua.indexOf('MSIE ');
        if (msie > 0) return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        const trident = ua.indexOf('Trident/');
        if (trident > 0) {
            const rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
        }
        const edge = ua.indexOf('Edge/');
        return edge > 0 && parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10)
    }
}
