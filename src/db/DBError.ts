export class DBError extends Error {
  public code: any;
  public errno: any;
  public sqlMessage: any;
  public sqlState: any;

  constructor(
    message: any,
    code: any,
    errno: any,
    sqlMessage: any,
    sqlState: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
    this.code = code;
    this.errno = errno;
    this.sqlMessage = sqlMessage;
    this.sqlState = sqlState;
  }
}
