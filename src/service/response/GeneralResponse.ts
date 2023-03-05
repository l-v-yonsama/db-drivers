export class GeneralResponse<T = any> {
  public ok = true;
  public message = '';
  public result?: T;

  constructor(ok = true, message = '') {
    this.ok = ok;
    this.message = message;
  }
}
