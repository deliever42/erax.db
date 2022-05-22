export class BaseDatabase<V> {
    public cache: { [key: string]: V } = {};

    public toJSON(): { [prop: string]: any } {
        return [...[this]][0];
    }
}
