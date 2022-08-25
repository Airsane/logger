import Logger from "./index";
import path from "path";
import {DirPath} from "./DirPath";

export class LogFileBuilder {
    private baseName: string;
    private path: DirPath | null;
    private logLevel: number;


    constructor() {
        this.path = null;
        this.baseName = "";
        this.logLevel = 0;
    }

    public build(): Logger {
        if (this.baseName === "") {
            throw new Error('Filename is not set!');
        }

        this.setPathDefault();
        const fileName = path.join(this.path!.create(), `${this.baseName}.log`);
        return new Logger(fileName);
    }

    private setPathDefault() {
        if (this.path === null) {
            this.path = new DirPath(path.join(process.cwd(), "./log/"), [], true);
        }
    }

    public setDir(name: string) {
        this.setPathDefault();
        this.path!.setSubDirs([name]);
        return this;
    }

    public setSubDirs(subDirs: string[]) {
        this.setPathDefault();
        this.path!.setSubDirs(subDirs);
        return this;
    }

    public setPath(dirPath: DirPath): LogFileBuilder {
        this.path = dirPath;
        return this;
    }

    public setName(name: string): LogFileBuilder {
        this.baseName = name;
        return this;
    }

    private static getTime() {
        return new Date().toISOString().replace(/[:,-]/g, "_").replace('Z', "");
    }

    public setNameWithT() {
        this.baseName = `${this.baseName}_${LogFileBuilder.getTime()}`;
        return this;
    }

}