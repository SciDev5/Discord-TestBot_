//@ts-check
import fs from "fs";

class JSONHelper {
    /**
     * 
     * @param {string} fileName the name of the file
     * @param {any} nameReplacers 
     * @returns {Promise<any>}
     */
    static readAsync(fileName,nameReplacers) {
        var name = fileName;
        for (var replacerId in nameReplacers) {
            var replacer = `<${replacerId}>`;
            name = name.replace(replacer,nameReplacers[replacerId]);
        }
        return new Promise((res,rej) => 
            fs.readFile(name, (err,data) => {
                if (err) rej(err);
                else     res(JSON.parse(data.toString("utf-8")));
            })
        );
    }
}

export default JSONHelper;