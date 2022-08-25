import * as fs from "fs";
import {LogFileBuilder} from "./LogFileBuilder";
import path from "path";

export enum LogFileLevel {
    INFO = 1,
    DEBUG = 2,
    WARN = 4,
    ERROR = 8,
}

export enum LogFileOpt {
    LOGFILE_OPT_NONE = 0,
    LOGFILE_OP_APPEND = 1,
    LOGFILE_OPT_NOCREATE = 2,
    LOGFILE_OPT_MAXSIZEKB = 4,
    LOGFILE_OPT_LEVEL = 8,
    LOGFILE_OPT_ROTATE = 16
}

export default class Logger {

    private static singleton: Logger | null = null;
    private readonly filename: string;
    private level: number;
    private readonly consoleLog: number;

    constructor(filename: string = "latest.log") {
        this.filename = filename;
        this.level = LogFileLevel.INFO | LogFileLevel.WARN | LogFileLevel.ERROR | LogFileLevel.DEBUG;
        this.consoleLog = LogFileLevel.INFO | LogFileLevel.WARN | LogFileLevel.ERROR;
        this.generateLogFile();
        this.deleteOlderLogFiles();
    }

    public getName(): string {
        return this.filename;
    }

    private deleteOlderLogFiles(): void {
        const logFolderPath = path.join(process.cwd(), "./log/");

        if (!fs.existsSync(logFolderPath)) {
            fs.mkdirSync(logFolderPath);
        }

        const files = fs.readdirSync(logFolderPath);
        const logFiles = files.filter(file => file.endsWith(".log"))
        // filter files older than 10 days
        const olderThan10Days = logFiles.filter(file => {
            const fileDate = new Date(fs.statSync(path.join(logFolderPath, file)).mtime);
            const now = new Date();
            const diff = now.getTime() - fileDate.getTime();
            return diff > 1000 * 60 * 60 * 24 * 10;
        });

        olderThan10Days.forEach(file => {
            fs.unlinkSync(path.join(logFolderPath, file));
        });
    }

    public static builder(): LogFileBuilder {
        return new LogFileBuilder();
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

    private generateLogFile(): void {
        const date = new Date();
        fs.writeFileSync(this.filename, `${this.getDateString(date)} [${LogFileLevel[LogFileLevel.INFO]}] Logging started!`);
    }

    public getDateString(date: Date): string {
        return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + (date.getDate())).slice(-2)} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}:${("0" + date.getMilliseconds()).slice(-2)}`

    }

    public writeData(logLevel: LogFileLevel, message: string, moduleName: string) {
        if (this.level & logLevel) {
            const date = new Date();
            message = moduleName === "" ? message : `[${moduleName}] ${message}`;
            if (this.consoleLog & logLevel)
                console.log(`${this.getDateString(date)} [${LogFileLevel[logLevel]}] ${message}`)
            fs.appendFileSync(this.filename, `\n${this.getDateString(date)} [${LogFileLevel[logLevel]}] ${message}`)
        }

    }

    public debug(message: string, moduleName: string = "") {
        this.writeData(LogFileLevel.DEBUG, message, moduleName);
    }

    public info(message: string, moduleName: string = "") {
        this.writeData(LogFileLevel.INFO, message, moduleName);
    }

    public warn(message: string, moduleName: string = "") {
        this.writeData(LogFileLevel.WARN, message, moduleName);
    }

    public error(message: string, moduleName: string = "") {
        this.writeData(LogFileLevel.ERROR, message, moduleName);
    }


    public static getSingleton() {
        if (!this.singleton)
            this.singleton = new Logger();
        return this.singleton
    }

}