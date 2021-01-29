import CommandExecutor from "../commands/executor.js";

const Executors = {
    global: {
        
    },
    testguild: {
        testcmd: new CommandExecutor(1,[ // testcmd
            {path:["sub0"],cmd:(params)=>{ // testcmd sub0
                return {type:4,data:{content:"you used the first one: "+JSON.stringify(params)}};
            }},
            {path:["sub"],cmd:(params)=>{ // testcmd sub
                return {type:4,data:{content:"you used the second one: "+JSON.stringify(params)}};
            }}
        ])
    }
};
Object.freeze(Executors);

export default Executors;