//@ts-check
import { Channel, Client, Guild, GuildMember, TextChannel } from "discord.js";
import CommandExecutor from "../commands/executor.js"; 
import JSONHelper from "../utils/json-helper.js";

async function getJSONFile(name) {
    return await JSONHelper.readAsync("./.data/robotics-meetings/<FNAME>.json",{FNAME:name});
}
async function setJSONFile(name,content) {
    return await JSONHelper.writeAsync("./.data/robotics-meetings/<FNAME>.json",content,{FNAME:name});
}

function unpackParams(paramsList) {
    /**@type {any}*/
    var params = {};
    for (var param of paramsList) 
        params[param.name] = param.value;
    return params;
}

/**
 * @param {string | number | Date} dateStr
 */
function formatDate(dateStr) {
    var date = new Date(dateStr);
    if (isNaN(date.getTime())) throw new Error("Date Invalid");
    return date.toLocaleString("en-us",{month:"numeric",day:"numeric",year:"numeric"});
}

function validateAndFormat(params) {
    if (params.date) try {
        if (!/^\d{1,2}\/\d{1,2}\/(\d{2}){1,2}$/.test(params.date)) throw new Error();
        params.date = formatDate(params.date);
    } catch (e) { 
        return "param `date` is not a valid Date.";
    }
}
/**
 * 
 * @param {string[]} arr 
 * @param {string} date 
 */
function removeDateFromArr(arr,date) {
    for (var i = arr.length-1; i >= 0; i--)
        if (arr[i] == date || arr[i] == date+"*")
            arr.splice(i,1);
}

/**
 * @param {string} dateCheckStr
 * @param {Date} now
 */
function dateIsPassed(dateCheckStr,now) {
    try {
    var dateCheck = new Date(/^([\d\/]*?)\*?$/.exec(dateCheckStr)[1]);
    return now > dateCheck && (now.getDate() > dateCheck.getDate() || now.getMonth() > dateCheck.getMonth() || now.getFullYear() > dateCheck.getFullYear());
    } catch (e) {return true}
}

async function clearPastMeetings() {
    var now = new Date();
    var attendence = await getJSONFile("attendence");
    var meetings = await getJSONFile("meetings");

    for (var k in attendence)
        for (var i = attendence[k].length-1; i >= 0; i--)
            if (dateIsPassed(attendence[k][i],now))
                attendence[k].splice(i,1);
    var meetingsToRemove = [];
    for (var k in meetings) 
        if (dateIsPassed(k,now))
            meetingsToRemove.push(k);
    for (var date of meetingsToRemove)
        delete meetings[date];

    await setJSONFile("attendence",attendence);
    await setJSONFile("meetings",meetings);
}

const MEETING_TYPES = getJSONFile("meeting-types");
/**
 * @param {string} date
 * @param {any} meetings
 */
async function meetingInfo(date,meetings) {
    var type = (await MEETING_TYPES)[meetings[date]];
    if (type == null) return `[No meeting scheduled - ${date}]`;
    return `${type.name} ${date} [${numericTimeToString(type.time[0])} - ${numericTimeToString(type.time[1])}]`;
}
/**
 * 
 * @param {number} time 
 * @param {boolean =} hrs24 
 */
function numericTimeToString(time,hrs24) {
    var hr = Math.floor(time/60);
    var min = Math.floor(time)%60;
    return (hrs24?hr:((hr-1)%12+1))+":"+(min<10?"0":"")+min;
}
/**
 * 
 * @param {string[]} strs 
 * @returns {string[]}
 */
function sortDateStrs(strs) {
    return strs.sort((a,b)=>new Date(a).getTime()-new Date(b).getTime());
}

async function announce(str, meetName) {
    var client = Executors.client;
    var data = await getJSONFile("data");
    var targetInfo = {};
    for (var guildId in data["announce-role"]) targetInfo[guildId] = {role:data["announce-role"][guildId]}
    for (var guildId in data["announce-channel"]) targetInfo[guildId].channel = data["announce-channel"][guildId];
    for (var guildId in targetInfo) {
        var target = targetInfo[guildId];
        if (target.channel) {
            var guild = new Guild(client,{id:guildId});
            var chan = new TextChannel(guild,{id:target.channel});
            chan.send(`<@&${target.role}> **${meetName}**\n${str}`)
        }
    }
}

var lastLoop = new Date();
const Executors = {
    /**@type {Client}*/
    client:null,
    loop: async () => {
        await clearPastMeetings();
        var meetings = await getJSONFile("meetings");
        var now = new Date();
        var meetingToday = meetings[formatDate(now)];
        if (meetingToday && now.getMinutes() != lastLoop.getMinutes()) {
            var todayMeetingType = (await MEETING_TYPES)[meetingToday];
            if (todayMeetingType.announce) {
                var mDate = new Date(`${formatDate(now)} ${numericTimeToString(todayMeetingType.time[2],true)}`);
                console.log(mDate.toLocaleTimeString(),now.toLocaleTimeString(),lastLoop.toLocaleTimeString());
                if (now > mDate && lastLoop < mDate)
                    await announce(todayMeetingType.announce, await meetingInfo(formatDate(now),meetings));
            }
        }
        lastLoop = now;
    },
    "global": {
    },
    "robotics-meetings": {
        "meeting": new CommandExecutor(1,[
            {path:["signup"],cmd:async(params,interaction)=>{ // date: str; ?boolean: leaveEarly
                await clearPastMeetings();
                /**@type {{date: string, "leave-early"?: boolean}}*/
                var paramsKV = unpackParams(params);
                var validationErr = validateAndFormat(paramsKV);
                if (validationErr) return {type:4,data:{content:"*Validation Error:* "+validationErr}};
                var attendence = await getJSONFile("attendence");
                var meetings = await getJSONFile("meetings");
                var userAttendence = attendence[interaction.member.user.id] || []; attendence[interaction.member.user.id] = userAttendence;
                removeDateFromArr(userAttendence,paramsKV.date);
                userAttendence.push(paramsKV.date+(paramsKV["leave-early"]?"*":""));
                setJSONFile("attendence",attendence);
                return {type:4,data:{content:`<@${interaction.member.user.id}> Signed up for meeting ${await meetingInfo(paramsKV.date,meetings)}.`+(paramsKV["leave-early"]?" (leaving early)":"")}};
            }},
            {path:["unsignup"],cmd:async(params,interaction)=>{ // date: str;
                await clearPastMeetings();
                /**@type {{date: string}}*/
                var paramsKV = unpackParams(params);
                var validationErr = validateAndFormat(paramsKV);
                if (validationErr) return {type:4,data:{content:"*Validation Error:* "+validationErr}};
                var attendence = await getJSONFile("attendence");
                var meetings = await getJSONFile("meetings");
                var userAttendence = attendence[interaction.member.user.id] || []; attendence[interaction.member.user.id] = userAttendence;
                console.log(userAttendence);
                removeDateFromArr(userAttendence,paramsKV.date);
                setJSONFile("attendence",attendence);
                return {type:4,data:{content:`<@${interaction.member.user.id}> Un-signed up for meeting on ${await meetingInfo(paramsKV.date,meetings)}.`}};
            }},
            {path:["add"],cmd:async(params,interaction)=>{ // date: str; type: str (MEETING_TYPES)
                /**@type {{date: string; type: string}}*/
                var paramsKV = unpackParams(params);
                var validationErr = validateAndFormat(paramsKV);
                if (!(await MEETING_TYPES)[paramsKV.type.toUpperCase()]) validationErr = "param `type` is not one of: "+(await (async ()=>{
                    var mt = (await MEETING_TYPES); var l = []; for (var k in mt) l.push(k); return JSON.stringify(l);
                })());
                if (validationErr) return {type:4,data:{content:"*Validation Error:* "+validationErr}};
                var meetings = await getJSONFile("meetings");
                if (!meetings[paramsKV.date]) {
                    meetings[paramsKV.date] = paramsKV.type.toUpperCase();
                    var m = await meetingInfo(paramsKV.date,meetings);
                    await setJSONFile("meetings",meetings);
                    clearPastMeetings();
                    return {type:4,data:{content:`<@${interaction.member.user.id}> Created meeting ${m}.`}};
                } else {
                    clearPastMeetings();
                    return {type:4,data:{content:`<@${interaction.member.user.id}> There is already a meeting on ${paramsKV.date}, delete it first.`}};
                }
            }},
            {path:["remove"],cmd:async(params,interaction)=>{ // date: str;
                /**@type {{date: string}}*/
                var paramsKV = unpackParams(params);
                var validationErr = validateAndFormat(paramsKV);
                if (validationErr) return {type:4,data:{content:"*Validation Error:* "+validationErr}};
                var meetings = await getJSONFile("meetings");
                if (meetings[paramsKV.date]) {
                    var m = await meetingInfo(paramsKV.date,meetings);
                    delete meetings[paramsKV.date];
                    await setJSONFile("meetings",meetings);
                    clearPastMeetings();
                    return {type:4,data:{content:`<@${interaction.member.user.id}> Deleted meeting ${m}.`}};
                } else {
                    clearPastMeetings();
                    return {type:4,data:{content:`<@${interaction.member.user.id}> Nothing changed.`}};
                }
            }},
            {path:["upcoming"],cmd:async(params,interaction)=>{ // ?amount: int;
                await clearPastMeetings();
                /**@type {{amount?: number}}*/
                var paramsKV = unpackParams(params);
                var validationErr = validateAndFormat(paramsKV);
                if (validationErr) return {type:4,data:{content:"*Validation Error:* "+validationErr}};
                var meetings = await getJSONFile("meetings");
                var dates = []; for (var date in meetings) dates.push(date);
                var len = Number.isInteger(paramsKV.amount)&&paramsKV.amount>0?paramsKV.amount:10;
                dates = sortDateStrs(dates); if (dates.length > len) dates.splice(len);
                var content = "**Upcoming Meetings:**";
                for (var date of dates)
                    content += `\n - ${await meetingInfo(date,meetings)}`;
                return {type:4,data:{content}};
            }},
            {path:["attendence"],cmd:async(params,interaction)=>{ // date: str;
                await clearPastMeetings();
                /**@type {{date: string}}*/
                var paramsKV = unpackParams(params);
                var validationErr = validateAndFormat(paramsKV);
                if (validationErr) return {type:4,data:{content:"*Validation Error:* "+validationErr}};
                var attendence = await getJSONFile("attendence");
                var meetings = await getJSONFile("meetings");
                var content = `Attendence for **${await meetingInfo(paramsKV.date,meetings)}**`;
                var attendees = [];
                for (var humin in attendence) for (var date of attendence[humin]) {
                    var regexExec = /^([\d\/]*?)(\*?)$/.exec(date);
                    if (regexExec && regexExec[1] == paramsKV.date)
                        attendees.push({id:humin,leaveEarly:regexExec[2].length>0});
                }
                for (var attendee of attendees)
                    content += `\n - <@${attendee.id}>`+(attendee.leaveEarly?" (leaving early)":"");
                if (attendees.length == 0)
                    content += "\n **nobody**"

                return {type:4,data:{content,allowed_mentions:{users:[]}}};
            }},
        ]),
        "announce-meetings": new CommandExecutor(1,[
            {path:["on"],cmd:async(params,interaction)=>{
                var globalData = await getJSONFile("data"), client = Executors.client;
                var member = new GuildMember(client,interaction.member,await client.guilds.fetch(interaction.guild_id));
                await member.roles.add(globalData["announce-role"][interaction.guild_id]);
                return {type:4,data:{content:`Now receiving announcements for user <@${member.id}>.`}};
            }},
            {path:["off"],cmd:async(params,interaction)=>{
                var globalData = await getJSONFile("data"), client = Executors.client;
                var member = new GuildMember(client,interaction.member,await client.guilds.fetch(interaction.guild_id));
                member.roles.remove(globalData["announce-role"][interaction.guild_id]);
                return {type:4,data:{content:`No longer receiving announcements for user <@${member.id}>.`}};
            }},
            {path:["setchannel"],cmd:async(params,interaction)=>{
                var globalData = await getJSONFile("data");
                /**@type {{channel: string}}*/
                var paramsKV = unpackParams(params);
                if (!globalData["announce-channel"][interaction.guild_id]) globalData["announce-channel"][interaction.guild_id] = {};
                globalData["announce-channel"][interaction.guild_id] = paramsKV.channel;
                await setJSONFile("data",globalData);
                return {type:4,data:{content:`Announcements now going through <#${paramsKV.channel}>.`}};
            }}
        ])
    }
};
//Object.freeze(Executors);

export default Executors;