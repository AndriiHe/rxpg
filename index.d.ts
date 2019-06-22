import { Observable } from "rxjs";
import { ConnectionConfig } from "pg";

export class RxPg {
    private pool;
    constructor(config?: string | ConnectionConfig);
    query(sql: string, values?: any): Observable<any>;
    transaction(queries: ((rxpg: RxPg, prevResult: any) => Observable<any>)[]): Observable<any>;
}
