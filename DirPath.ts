import fs from "fs";
import path from "path";

enum STRATEGY {
    CREATE,
    STOP
}

export class DirPath {
    private readonly startPath: string;
    private path!: string;
    private subDirs: string[];
    private readonly createPath: boolean;

    private ACCESS_MODE_DEFAULT = '0777';


    constructor(dirPath: string, subDirs: string[] = [], createPath: boolean = false) {
        this.startPath = dirPath;
        this.subDirs = subDirs;
        this.createPath = createPath;
    }

    private createPathDir() {
        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path, {recursive: true, mode: this.ACCESS_MODE_DEFAULT});
        }
    }

    public setSubDirs(subDirs: string[]) {
        this.subDirs = subDirs
    }

    private inspect(strategy: STRATEGY) {
        this.path = this.startPath;
        if (this.createPath) {
            this.createPathDir();
        }

        if (!fs.existsSync(this.path)) {
            throw new Error("Path doesnt exists " + this.path);
        }

        this.subDirs.forEach((dir) => {
            this.path = path.join(this.path, dir);
            if (!fs.existsSync(this.path)) {
                switch (strategy) {
                    case STRATEGY.CREATE:
                        if (!fs.mkdirSync(this.path, {recursive: true, mode: this.ACCESS_MODE_DEFAULT})) {
                            throw new Error("Error by creating path " + this.path);
                        }
                        break;
                    case STRATEGY.STOP:
                        return false;
                    default:
                        throw new Error("Invalid strategy");
                }
            }
        })
        return true;
    }

    public create(): string {
        return this.inspect(STRATEGY.CREATE) ? this.path : "";
    }

    public exists(): boolean {
        return this.inspect(STRATEGY.STOP);
    }

    public getPath(): string {
        return this.path;
    }
}