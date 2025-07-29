export var Role;
(function (Role) {
    Role["User"] = "user";
    Role["Computer"] = "computer";
    Role["Assistant"] = "assistant";
    Role["System"] = "system";
    Role["Tool"] = "tool";
})(Role || (Role = {}));
export var MessageType;
(function (MessageType) {
    MessageType["Message"] = "message";
    MessageType["Console"] = "console";
    MessageType["Image"] = "image";
    MessageType["Code"] = "code";
    MessageType["Audio"] = "audio";
})(MessageType || (MessageType = {}));
export var Format;
(function (Format) {
    Format["ActiveLine"] = "active_line";
    Format["Output"] = "output";
    Format["Base64"] = "base64";
    Format["Base64Png"] = "base64.png";
    Format["Base64Jpeg"] = "base64.jpeg";
    Format["Path"] = "path";
    Format["Html"] = "html";
    Format["Js"] = "javascript";
    Format["PY"] = "python";
    Format["R"] = "r";
    Format["AppleScript"] = "applescript";
    Format["Shell"] = "shell";
    Format["Wav"] = "wav";
})(Format || (Format = {}));
