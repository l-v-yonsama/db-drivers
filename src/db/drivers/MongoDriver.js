import * as DbRes from '../resource/DbResource';

export default class MongoDriver {
  constructor() {
    this.client = require('mongodb').MongoClient;
    this.isConnected = false;
    this.dbMap = {};
  }
  getName() {
    return 'MongoDriver';
  }
  setProperties(prop) {
    this.name = prop.name;
    this.url = prop.url;
  }
  connect() {
    const self = this;
    this.isConnected = false;
    return new Promise((resolve, reject) => {
      console.log('connect to ', this.url);
      this.client.connect(this.url, function (err, db) {
        if (err) {
          console.error('Connection failure.', err, db);
          reject(new Error('[Connection failure]:' + err.message));
        } else {
          console.info('Connection success.');
          self.isConnected = true;
          self.db = db;
          var adminDb = self.db.admin();
          adminDb.listDatabases(function (err, dbs) {
            console.log('listed..');
            if (err) {
              console.log('has error..', err);
              reject(new Error(err.message));
            } else {
              dbs.databases.forEach((database) => {
                self.dbMap[database.name] = database;
              });
              resolve({ ok: true });
            }
          });
        }
      });
    });
  }
  requestSql(sql) {
    return new Promise((resolve, reject) => {
      const self = this;
      console.log('sql=', sql);
      const db = self.db.db('yon_test');
      var collection = db.collection('content_rs');
      collection
        .find({})
        .toArray()
        .then((docs) => {
          console.log('done', docs);
          resolve(docs);
        });
    });
  }
  getInfomationSchemas() {
    const self = this;
    console.log('driver.js 43 create promsie');
    return new Promise((resolve, reject) => {
      let dbResources = [];
      console.log('start refreshResouces ');
      let promiseList = [];
      Object.values(self.dbMap).forEach((database) => {
        let schema = new DbRes.DbSchema();
        schema.name = database.name;
        schema.comment = 'sizeOnDisk: ' + database.sizeOnDisk;
        dbResources.push(schema);
        const db1 = self.db.db(database.name);
        console.log('db1=', db1);
        promiseList.push(
          new Promise((resolve, reject) => {
            db1.listCollections({}).toArray(function (err, items) {
              if (!err) {
                items.forEach((t) => {
                  let table = new DbRes.DbTable();
                  table.name = t.name;
                  table.comment = 'Index: ' + t.idIndex;
                  schema.children.push(table);
                });
              }
              resolve(items);
            });
          }),
        );
      });
      console.log('loopend...');
      Promise.all(promiseList)
        .then((results) => {
          console.log('okkkkkkk', results);
          resolve(dbResources);
        })
        .catch((e) => {
          console.log('sippai', e);
          resolve(dbResources);
        });
    });
  }
  close() {
    this.isConnected = false;
    if (this.db) {
      console.log('closed...');
      this.db.close();
    }
  }
}
