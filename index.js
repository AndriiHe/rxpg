const { from } = require('rxjs');
const { Pool, Client } = require('pg');
const { flatMap, tap, count, catchError } = require('rxjs/operators');
const url = require('url');

class RxPg {

  constructor(config) {
    if (!config) {
      this.pool = new Pool();
      return;
    }
    if (config instanceof Client) {
      this.pool = config;
    } else if (typeof(config) === 'string') {
      const params = url.parse(config);
      const auth = params.auth ? params.auth.split(':') : [];
      this.pool = new Pool({
        user: auth[0],
        password: auth[1],
        host: params.hostname,
        port: parseInt(params.port || ''),
        database: params.pathname ? params.pathname.split('/')[1] : ''
      });
    } else {
      this.pool = new Pool(config);
    }
  }

  query(sql, params) {
    return from(this.pool.query(sql, params));
  }

  transaction(...queries) {
    let connection = null;
    let rxpg = null;
    return from(this.pool.connect()).pipe(
      tap(pgConnection => connection = pgConnection),
      tap(connection => rxpg = new RxPg(connection)),
      flatMap(() => rxpg.query('BEGIN')),
      ...queries.map(query => flatMap(prevResult => query(rxpg, prevResult))),
      count(),
      flatMap(() => rxpg.query('COMMIT')),
      catchError(err => {
        return rxpg.query('ROLLBACK').pipe(
          tap(() => connection.release()),
          tap(() => { throw err; })
        );
      }),
      tap(() => connection.release())
    );
  }
}

module.exports.RxPg = RxPg;
