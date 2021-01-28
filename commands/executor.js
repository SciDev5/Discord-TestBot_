//@ts-check
import { MessageEmbed } from "discord.js";
import CommandManager from "./manager.js";
import Coomands from "./exec-initalizer.js";
import Executors from "./exec-initalizer.js";

class CommandExecutor {
    /**
     * @param {number} cmdLevels
     * @param {{path:string[],cmd:((params: {name:string,value:any}[]) => {type:number,data:{tts?:boolean,content:string,embeds?:MessageEmbed,allowed_mentions?:import("discord.js").MessageMentionTypes}})}[]} executions 
     */
    constructor(cmdLevels,executions) {
        this.executions = executions;
        this.cmdLevels = cmdLevels;
    }
    /**
     * 
     * @param {{name:string,value?:any,options?:any[]}} options 
     * @param {string[] =} path
     * @returns {{type:number,data:{tts?:boolean,content:string,embeds?:MessageEmbed,allowed_mentions?:import("discord.js").MessageMentionTypes}}}
     */
    call(options,path){
        /**@type {string[]}*/
        var path_ = path || [];
        if (this.cmdLevels > path_.length)
            for (var subCommand of options.options)
                return this.call(subCommand,path_.concat(subCommand.name));
        else
            return this.execCommand(options.options,path);
    }
    /**
     * @param {{name:string,value:any}[]} params
     * @param {string[]} path
     */
    execCommand(params,path) {
        var executor = null;
        for (var exec of this.executions) {
            if (this.checkExecMatches(exec,path)) {
                executor = exec; break;
            }
        }
        if (!executor) throw new Error("sub command executor missing");
        return exec.cmd(params || []);
    }

    /**
     * @param {{path:string[],cmd:any}} exec 
     * @param {string[]} path 
     */
    checkExecMatches(exec,path) {
        if (exec.path.length != path.length) return false;
        for (var i = 0; i < path.length; i++)
            if (exec.path[i] != path[i]) return false;
        return true;
    }
}

export default CommandExecutor;

