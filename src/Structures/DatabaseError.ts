import { red, blue, gray } from "colorette"

export class DatabaseError extends Error {
    constructor(message: string) {
        super(`${blue('[ EraxDB ]')} => ${red('Error:')} ${gray(message)}`);
    }
};
