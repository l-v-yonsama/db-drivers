import {
  parse,
  Statement,
  parseFirst,
  parseWithComments,
  toSql,
} from 'pgsql-ast-parser';

// parse multiple statements
/*
[
  {
    "type": "begin"
  },
  {
    "type": "insert",
    "into": {
      "name": "my_table"
    },
    "insert": {
      "type": "values",
      "values": [
        [
          {
            "type": "integer",
            "value": 1
          },
          {
            "type": "string",
            "value": "two"
          }
        ]
      ]
    }
  }
]
*/
// const ast: Statement[] = parse(`BEGIN TRANSACTION;
//                                 insert into my_table values (1, 'two')`);

// console.log(JSON.stringify(ast, null, 2));

// parse a single statement
/*
{
  "columns": [
    {
      "expr": {
        "type": "ref",
        "name": "*"
      }
    }
  ],
  "from": [
    {
      "type": "table",
      "name": {
        "name": "my_table"
      }
    }
  ],
  "type": "select"
}
*/
// const ast2: Statement = parseFirst(`SELECT * FROM "my_table";`);
// console.log(JSON.stringify(ast2, null, 2));

const { normalized, toArgList } = normalize(
  'select * from xxx where id = :id AND other=:other + :id',
);

const ast25: Statement = parseFirst(normalized);
console.log(JSON.stringify(ast25, null, 2));
console.log(toArgList({ id: 'myId', other: 42 }));

// const twoWaySql = `
// /*IF pmb.isPaging()*/
// select mb.MEMBER_ID
//      , mb.MEMBER_NAME
//      , (select sum(pur.PURCHASE_PRICE)
//           from PURCHASE pur
//          where pur.MEMBER_ID = mb.MEMBER_ID
//            and pur.PAYMENT_COMPLETE_FLG = 0
//        ) as UNPAID_PRICE_SUMMARY
//      , stat.MEMBER_STATUS_NAME
// -- ELSE select count(*)
// /*END*/
//   from MEMBER mb
//     /*IF pmb.isPaging()*/
//     left outer join MEMBER_STATUS stat
//       on mb.MEMBER_STATUS_CODE = stat.MEMBER_STATUS_CODE
//     /*END*/
//  /*BEGIN*/
//  where
//    /*IF pmb.memberId != null*/
//        mb.MEMBER_ID = /*pmb.memberId*/3
//    /*END*/
//    /*IF pmb.memberStatusCode != null*/
//    and mb.MEMBER_STATUS_CODE = /*pmb.memberStatusCode*/'FML'
//    /*END*/
//    /*IF pmb.unpaidMemberOnly*/
//    and exists (select pur.PURCHASE_ID
//                  from PURCHASE pur
//                 where pur.MEMBER_ID = mb.MEMBER_ID
//                   and pur.PAYMENT_COMPLETE_FLG = 0
//        )
//    /*END*/
//  /*END*/
//  /*IF pmb.isPaging()*/
//  order by UNPAID_PRICE_SUMMARY desc, mb.MEMBER_ID asc
//  /*END*/`;

// const r3 = parseWithComments(twoWaySql, { locationTracking: true });

// console.log('------------- ast3 ----------------');
// console.log(JSON.stringify(r3.ast, null, 2));

// console.log('------------- ast3-comments ----------------');
// console.log(JSON.stringify(r3.comments, null, 2));

// console.log('------------- ast3-to-sql ----------------');
// const sql: string = toSql.statement(r3.ast[0]);
// console.log(sql);

function normalize(query) {
  let i = 0;
  const byName = {};
  const normalized = query.replace(/(?<!:):(\w+)\b/gi, (_, x) => {
    if (byName[x]) {
      return '$' + byName[x];
    }
    return '$' + (byName[x] = ++i);
  });

  const keys = Object.keys(byName);
  function toArgList(args) {
    const ret = Array(keys.length);
    for (const k of keys) {
      ret[byName[k] - 1] = args[k];
    }
    return ret;
  }
  return { normalized, toArgList };
}
