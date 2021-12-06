import * as fs from "fs";
import * as path from "path";

export enum LogLevel {
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL
}

export default class Logger {

    private static singleton:Logger|null = null;
    private filename: string;
    private readonly filePath: string

    constructor(filename: string = "latest.log") {
        this.filename = filename;
        this.filePath = path.join(__dirname, "../log/" + filename);
        Logger.generateFolder();
        this.generateLogFile();

    }

    private static generateFolder(): void {
        const dir = path.join(__dirname, "../log");
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
    }

    private generateLogFile(): void {
        if(fs.existsSync(this.filePath)){
            const {birthtime} = fs.statSync(this.filePath)
            fs.renameSync(this.filePath,path.join(__dirname, "../log/" + `${birthtime.getFullYear()}${("0" + (birthtime.getMonth() + 1)).slice(-2)}${("0" + (birthtime.getDate())).slice(-2)}_${("0" + birthtime.getHours() ).slice(-2)}${("0" + birthtime.getMinutes()).slice(-2)}${("0" + birthtime.getSeconds()).slice(-2)}.log`));
        }
        const date = new Date();
        fs.writeFileSync(this.filePath, `${this.getDateString(date)} [${LogLevel[LogLevel.INFO]}] Logging started!`);
    }

    public getDateString(date:Date):string{
        return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + (date.getDate())).slice(-2)} ${("0" + date.getHours() ).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}:${("0" + date.getMilliseconds()).slice(-2)}`

    }

    public writeData(logLevel:LogLevel,message:string) {
        const date = new Date();
        console.log(`${this.getDateString(date)} [${LogLevel[logLevel]}] ${message}`)
        fs.appendFileSync(this.filePath,`\n${this.getDateString(date)} [${LogLevel[logLevel]}] ${message}`)
    }

    public debug(message:string,moduleName:string = ""){
        this.writeData(LogLevel.DEBUG,`${moduleName === "" ? "" : `[${moduleName}]`}${message}`);
    }

    public info(message:string,moduleName:string = ""){
        this.writeData(LogLevel.INFO,`${moduleName === "" ? "" : `[${moduleName}]`}${message}`);
    }

    public warn(message:string,moduleName:string = ""){
        this.writeData(LogLevel.WARN,`${moduleName === "" ? "" : `[${moduleName}]`}${message}`);
    }

    public error(message:string,moduleName:string = ""){
        this.writeData(LogLevel.ERROR,`${moduleName === "" ? "" : `[${moduleName}]`}${message}`);
    }

    public static getSingleton(){
        if(!this.singleton)
            this.singleton = new Logger();
        return this.singleton
    }

    public fatal(message:string){
        this.writeData(LogLevel.FATAL,message);
    }
}