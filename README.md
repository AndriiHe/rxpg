# RxPg

## Installation
```
$ npm i rxpg
```

## Getting started
```js
import { RxPg } from 'rxpg';
```

There are three possible approaches for RxPg initialization:

With env variables: 

```
PGHOST='localhost'
PGUSER='root'
PGDATABASE='postgres'
PGPASSWORD='root'
PGPORT=5432
```
 
```js
const rxpg = new RxPg();
```

With connection url
```js
const rxpg = new RxPg('postgres://user:password@host:port/database');
```

With config object
```js
const rxpg = new RxPg({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'postgres',
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

Query example
```js
rxpg.query(
  'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *',
  ['brianc', 'brian.m.carlson@gmail.com']
).subscribe(console.log)

```

Transaction example
```js
rxpg.transaction(
  (rxpg, previousQueryResult) => rxpg.query('INSERT INTO users(name) VALUES($1) RETURNING id', ['brianc']),
  (rxpg, previousQueryResult) => rxpg.query('INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)', previousQueryResult[0].id, 's3.bucket.foo'),
).subscribe(console.log);
```
