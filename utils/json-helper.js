//@ts-check
import fs from "fs";

class JSONHelper {
    /**
     * 
     * @param {string} fileName the name of the file
     * @param {any =} nameReplacers
     * @returns {Promise<any>}
     */
    static readAsync(fileName,nameReplacers) {
        var name = fileName;
        var nameReplacers_ = nameReplacers || []
        for (var replacerId in nameReplacers_) {
            var replacer = `<${replacerId}>`;
            name = name.replace(replacer,nameReplacers_[replacerId]);
        }
        return new Promise((res,rej) => 
            fs.readFile(name, (err,data) => {
                if (err) rej(err);
                else     res(JSON.parse(data.toString("utf-8")));
            })
        );
    }
    /**
     * 
     * @param {string} fileName the name of the file
     * @param {any =} nameReplacers
     * @returns {any}
     */
    static readSync(fileName,nameReplacers) {
        var name = fileName;
        var nameReplacers_ = nameReplacers || [];
        for (var replacerId in nameReplacers_) {
            var replacer = `<${replacerId}>`;
            name = name.replace(replacer,nameReplacers_[replacerId]);
        }
        return JSON.parse(fs.readFileSync(name,{encoding:"utf-8"}));
    }

    /**
     * @param {string} fileName the name of the file
     * @param {any} content the content
     * @param {any =} nameReplacers
     * @returns {Promise<any>}
     */
    static writeAsync(fileName,content,nameReplacers) {
        var name = fileName;
        var nameReplacers_ = nameReplacers || []
        for (var replacerId in nameReplacers_) {
            var replacer = `<${replacerId}>`;
            name = name.replace(replacer,nameReplacers_[replacerId]);
        }
        return new Promise((res,rej)=>fs.writeFile(name,JSON.stringify(content),(err)=>{
            if (err) rej(err);
            else res();
        }));
    }
}

export default JSONHelper;