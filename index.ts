import * as fs from "fs";
import * as path from "path";

export enum LogFileLevel {
    INFO = 2,
    DEBUG = 4,
    WARN = 8,
    ERROR = 16,
}

export enum LogFileOpt {
    LOGFILE_OPT_NONE = 0,
    LOGFILE_OP_APPEND = 1,
    LOGFILE_OPT_NOCREATE = 2,
    LOGFILE_OPT_TIMESTAMP = 4,
    LOGFILE_OPT_MAXSIZEKB = 8,
    LOGFILE_OPT_LEVEL = 16,
    LOGFILE_OPT_ROTATE = 32
}

export default class Logger {

    private static singleton: Logger | null = null;
    private filename: string;
    private level: number;
    private readonly filePath: string
    private maxSize: number;

    constructor(filename: string = "latest.log") {
        this.filename = filename;
        this.filePath = path.join(__dirname, "../log/" + filename);
        this.level = LogFileLevel.INFO | LogFileLevel.WARN | LogFileLevel.ERROR;
        Logger.generateFolder();
        this.generateLogFile();
    }

    public getName(): string {
        return this.filename;
    }

    public setOption(optName: LogFileOpt, value: LogFileLevel | any) {
        let result: any;
        switch (optName) {
            case LogFileOpt.LOGFILE_OPT_LEVEL:
                result = this.level;
                this.level = value;
                break;
            default:
                result = false;
                break;
        }
        return result;
    }

    private static generateFolder(): void {
        const dir = path.join(__dirname, "../log");
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
    }

    private generateLogFile(): void {
        if (fs.existsSync(this.filePath)) {
            const {birthtime} = fs.statSync(this.filePath)
            fs.renameSync(this.filePath, path.join(__dirname, "../log/" + `${birthtime.getFullYear()}${("0" + (birthtime.getMonth() + 1)).slice(-2)}${("0" + (birthtime.getDate())).slice(-2)}_${("0" + birthtime.getHours()).slice(-2)}${("0" + birthtime.getMinutes()).slice(-2)}${("0" + birthtime.getSeconds()).slice(-2)}.log`));
        }
        const date = new Date();
        fs.writeFileSync(this.filePath, `${this.getDateString(date)} [${LogFileLevel[LogFileLevel.INFO]}] Logging started!`);
    }

    public getDateString(date: Date): string {
        return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + (date.getDate())).slice(-2)} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}:${("0" + date.getMilliseconds()).slice(-2)}`

    }

    public writeData(logLevel: LogFileLevel, message: string) {
        const date = new Date();
        console.log(`${this.getDateString(date)} [${LogFileLevel[logLevel]}] ${message}`)
        fs.appendFileSync(this.filePath, `\n${this.getDateString(date)} [${LogFileLevel[logLevel]}] ${message}`)
    }

    public debug(message: string, moduleName: string = "") {
        if (this.level & LogFileLevel.DEBUG)
            this.writeData(LogFileLevel.DEBUG, `${moduleName === "" ? "" : `[${moduleName}]`}${message}`);
    }

    public info(message: string, moduleName: string = "") {
        if (this.level & LogFileLevel.INFO)
            this.writeData(LogFileLevel.INFO, `${moduleName === "" ? "" : `[${moduleName}]`}${message}`);
    }

    public warn(message: string, moduleName: string = "") {
        if (this.level & LogFileLevel.WARN)
            this.writeData(LogFileLevel.WARN, `${moduleName === "" ? "" : `[${moduleName}]`}${message}`);
    }

    public error(message: string, moduleName: string = "") {
        if (this.level & LogFileLevel.ERROR)
            this.writeData(LogFileLevel.ERROR, `${moduleName === "" ? "" : `[${moduleName}]`}${message}`);
    }

    public static getSingleton() {
        if (!this.singleton)
            this.singleton = new Logger();
        return this.singleton
    }

}