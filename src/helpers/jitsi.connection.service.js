import {apiCall} from "./http.service";
import {CommonConstants} from "../constants/Common.constants";
import {LazyLoadContent} from "./lazyload.service";
import {clientCustomService} from "./custom.service.js";

let facingMode = "user" || CommonConstants.JITSI_CONSTANTS.LOCAL_TRACK_OPTIONS.facingMode;
let instance;

class JitsiConnection {
    constructor(callback) {
        sessionStorage.setItem("running_previous_call", "false");
        this.callback = callback;
        this.joined = false;
        this.localTracks = [];
        this.remoteTracks = {};
        this.room = undefined;
        this.meeting = undefined;
        this.meetingId = undefined;
        this.actionId = undefined;
        this.JitsiMeetJS = undefined;
        instance = this;
    }

    padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }

    formatDate(date) {
        return ([date.getFullYear(), this.padTo2Digits(date.getMonth() + 1), this.padTo2Digits(date.getDate()),].join('-') + ' ' + [this.padTo2Digits(date.getHours()), this.padTo2Digits(date.getMinutes()), this.padTo2Digits(date.getSeconds()),].join(':'));
    }

    switchCamera() {
        this.JitsiMeetJS.init(CommonConstants.JITSI_CONSTANTS.INIT_OPTIONS);
        this.JitsiMeetJS.mediaDevices.enumerateDevices(devices => {
            const isDeviceChangeAvailable = devices.filter(device => device.kind === 'videoinput').length > 1;
            if (isDeviceChangeAvailable) {
                facingMode = facingMode === 'user' ? "environment" : "user";
                CommonConstants.JITSI_CONSTANTS.LOCAL_TRACK_OPTIONS.facingMode = facingMode;
                this.stopVideoStream();
                this.createStreams();
            }
        });
    }

    stopVideoStream() {
        this.localTracks.forEach((track) => track.dispose());
    }

    initMeeting(actionId, meetingId) {
        this.actionId = actionId;
        this.meetingId = meetingId;
        if (!this.JitsiMeetJS) return;
        this.JitsiMeetJS.init(CommonConstants.JITSI_CONSTANTS.INIT_OPTIONS);
        this.JitsiMeetJS.mediaDevices.enumerateDevices(devices => {
            this.isDeviceChangeAvailable = devices.filter(device => device.kind === 'videoinput').length > 1;
            if (!this.isDeviceChangeAvailable) {
                // custom validation to validate the back camera if available
            }
        })
        this.JitsiMeetJS.setLogLevel(this.JitsiMeetJS.logLevels.ERROR);
        this.connection = new this.JitsiMeetJS.JitsiConnection(null, null, CommonConstants.JITSI_CONSTANTS.OPTIONS);
        this.connection.addEventListener(this.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, () => this.onConnectionSuccessfulEstablishment(this.connection));
        this.connection.addEventListener(this.JitsiMeetJS.events.connection.CONNECTION_FAILED, this.onConnectionFailed);
        this.connection.addEventListener(this.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, this.disconnect);
        this.JitsiMeetJS.mediaDevices.addEventListener(this.JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED, this.onDeviceListChanged);
        this.connection.connect();
    }

    joinCall(actionId, meetingId) {
        this.meetingId = meetingId;
        this.actionId = actionId;
        this.customService = clientCustomService.getInstance();
        apiCall(CommonConstants.ENDPOINTS.BASE_URL + CommonConstants.API_ENDPOINTS.JOIN_VIDEO_CHAT + actionId + "/action", null, {action: "ACCEPT"}, "POST")
            .then((response) => {
                console.log("Session info ", this.customService.sessionInfo["sid"], "Response", response);
                const res = response.response || response.data;
                if (res) {
                    this.initMeeting(actionId, meetingId);
                    this.getAgentAvailability(this.requestId);
                }
            })
            .catch((error) => {
                console.log("Error occured while joining call response: " + error);
            })
    }

    onConnectionFailed = () => {
    }

    disconnect = () => {
    }

    onDeviceListChanged = () => {
    }

    endMeeting(payload) {

        for (let i = 0; i < this.localTracks.length; i++) {
            if (this.localTracks[i]) {
                this.localTracks[i].stopStream();
            }
        }

        if (this.room) {
            this.room.leave();
        }

        let audioOpenTracks = this.room.rtc.getLocalTracks("audio");
        if (audioOpenTracks) {
            console.log("audioOpenTracks found");
        }

        let openTracks = this.room.rtc.getLocalTracks("video");
        if (openTracks) {
            console.log("openTracks found");
        }


        if (this.connection) {
            this.connection.disconnect();
        }
        this.localTracks = [];

        // function passed to stop meeting once the call is ended or any error occured
        if (this.callback) {
            this.callback(payload);
        }
    }

    createStreams = function () {
        this.JitsiMeetJS.createLocalTracks(CommonConstants.JITSI_CONSTANTS.LOCAL_TRACK_OPTIONS)
            .then(this.onLocalTracksAvailable.bind(this))
            .catch(error => {
                throw error;
            });
    }

    onLocalTracksAvailable(tracks) {
        this.localTracks = tracks;
        let localTracks = tracks;
        console.log("Here are the tracks", tracks);

        for (let i = 0; i < localTracks.length; i++) {
            localTracks[i].addEventListener(this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED, audioLevel => {
            });
            localTracks[i].addEventListener(this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, () => {
            });
            localTracks[i].addEventListener(this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, () => {
            });
            localTracks[i].addEventListener(this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED, deviceId => {
            });

            const payload = {
                reason: "Sending Local Streams",
                localTracks: localTracks[i]
            }

            const element = this.callback(payload);
            console.log("Element received from local config is", element);
            localTracks[i].attach(element);

            if (this.joined) {
                this.room.addTrack(localTracks[i])
            }
        }
    };

    onRemoteTracksAvailable(tracks) {
        if (tracks.isLocal()) {
            // Do nothing
            return;
        }

        const participant = tracks.getParticipantId();
        if (!this.remoteTracks[participant]) {
            this.remoteTracks[participant] = [];
        }
        const idx = this.remoteTracks[participant].push(tracks);

        tracks.addEventListener(
            this.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
            audioLevel => {
            });
        tracks.addEventListener(
            this.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
            () => {
            });
        tracks.addEventListener(
            this.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
            () => {
            });
        tracks.addEventListener(this.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
            deviceId => {
            });

        const id = participant + tracks.getType() + idx;
        const payload = {
            reason: "Sending Local Streams",
            remoteTracks: tracks
        }
        const element = this.callback(payload);
        tracks.attach(element);
    }

    onConnectionSuccessfulEstablishment(connection) {
        this.room = connection.initJitsiConference(this.meetingId.toLowerCase(), CommonConstants.JITSI_CONSTANTS.CONFERENCE_OPTIONS);
        this.room.on(this.JitsiMeetJS.events.conference.TRACK_ADDED, this.onRemoteTracksAvailable.bind(this));
        this.room.on(this.JitsiMeetJS.events.conference.TRACK_REMOVED, track => this.onRemoteTracksRemoved.bind(this));
        this.room.on(this.JitsiMeetJS.events.conference.CONFERENCE_JOINED, this.onConferenceJoined.bind(this));
        this.room.on(this.JitsiMeetJS.events.conference.USER_JOINED, id => this.remoteTracks[id] = []);
        this.room.on(this.JitsiMeetJS.events.conference.USER_LEFT, this.onUserLeft.bind(this));
        this.room.on(this.JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => console.log(`${track.getType()} - ${track.isMuted()}`));
        this.room.on(this.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, (userID, displayName) => console.log(`${userID} - ${displayName}`));
        this.room.on(this.JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`));
        this.room.on(this.JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED, () => console.log(`${this.room.getPhoneNumber()} - ${this.room.getPhonePin()}`));
        this.room.setSenderVideoConstraint(1080);
        this.room.setReceiverVideoConstraint(180);
        this.room.join();
        this.createStreams();
    }

    onRemoteTracksRemoved(tracks) {
        console.log("Tracks removed", tracks);
        const payload = {
            reason: "Removed Tracks",
            failure: "Remote tracks are removed"
        }

        this.callback(payload);
    }

    onUserLeft(id, user) {
        if (this.remoteVideoRef) {
            this.remoteVideoRef.remove();
            this.remoteVideoRef = null;
        }
    }

    onConferenceJoined() {
        this.joined = true;
        const payload = {
            reason: "Conference Joined",
            success: "User joined the current ongoing call",
        }
        this.callback(payload);
        for (let i = 0; i < this.localTracks.length; i++) {
            this.room.addTrack(this.localTracks[i]);
        }
    }

    async loadJITSI() {
        try {
            await LazyLoadContent(CommonConstants.VIDEO_STREAM_ENDPOINT.MEET);

        } catch (error) {
            await LazyLoadContent(CommonConstants.VIDEO_STREAM_ENDPOINT.MEET_EXTERNAL);
        }
        await LazyLoadContent("https://code.jquery.com/jquery-3.6.3.min.js");
        this.JitsiMeetJS = JitsiMeetJS;
        console.log("Jitsi Loaded", JitsiMeetJS);
    }

    getAgentAvailability(kycRequestId) {
        this.requestId = kycRequestId;
        let payload = {};

        if (sessionStorage.getItem("last_event_time_stamp") === undefined || sessionStorage.getItem("last_event_time_stamp") === "undefined") {
            sessionStorage.setItem("last_event_time_stamp", this.formatDate(new Date()));
        }

        payload.last_event_time_stamp = sessionStorage.getItem("last_event_time_stamp");
        sessionStorage.setItem("running_previous_call", "true");
        apiCall(CommonConstants.ENDPOINTS.BASE_URL + CommonConstants.API_ENDPOINTS.POLL_FOR_REQUEST + kycRequestId, null, payload, "POST")
            .then((response) => {
                let obj = response.response;
                let currentState = obj[obj.length - 1];
                if (currentState.event_time) {
                    sessionStorage.setItem("last_event_time_stamp", currentState.event_time);
                }
                switch (currentState.type) {
                    case "CALL_REQUEST_EXPIRED":
                        sessionStorage.setItem("running_previous_call", "false");
                        break;
                    case "CALL_STARTED":
                        if (this.JitsiMeetJS) {
                            this.meetingId = currentState.event_data.id;
                            this.actionId = currentState.event_data.txn_id;
                            sessionStorage.setItem("running_previous_call", "false");
                            this.joinCall(this.actionId, this.meetingId);
                        } else {
                            this.getAgentAvailability(kycRequestId);
                        }
                        break;
                    case "EXPIRED_POLLING_REQUEST":
                        this.getAgentAvailability(kycRequestId);
                        break;
                    case "EXPIRED_POLLING_SESSION":
                        sessionStorage.setItem("running_previous_call", "false");
                        break;
                    case "CALL_ENDED":
                        const callEndPayload = {
                            reason: "Call_ENDED",
                            success: "Call successfully completed"
                        }
                        this.endMeeting(callEndPayload);
                        break;
                    case "CALL_TERMINATED":
                        const responsePayload = {
                            reason: "Call_ENDED",
                            failure: "Call forcefully terminated by agent"
                        }
                        sessionStorage.setItem("running_previous_call", "false");
                        this.endMeeting(responsePayload);
                        break;
                    default:
                        this.getAgentAvailability(kycRequestId);
                        break;
                }
            })
            .catch((error) => {
                this.getAgentAvailability(kycRequestId);
                console.log("Error occured while polling request");
            })

    }

    requestForCall(requestId) {
        this.requestId = requestId;
        return new Promise((resolve, reject) => {
            apiCall(CommonConstants.ENDPOINTS.BASE_URL + CommonConstants.API_ENDPOINTS.REQUEST_VIDEOCHAT + requestId, null, null, "POST")
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    console.log("final Error occured");
                    reject(error);
                })
        })
    }

    callResponse (response) {
        if (response && response.response && response.response.success) {
            if (response.response.video_chat_group) {
                this.meetingId = response.response.video_chat_group.id;
                this.actionId = response.response.video_chat_group.txn_id;
                if (response.response.video_chat_group.second_user_status === 'waiting') {
                    this.joinCall(this.actionId, this.meetingId);
                } else {
                    this.initMeeting(this.actionId, this.meetingId);
                }
            } else {
                if(sessionStorage.getItem("running_previous_call") == "false" || !sessionStorage.getItem("running_previous_call")) {
                    this.getAgentAvailability(this.requestId);
                }
            }
        }
    }

}

export default JitsiConnection;