export class GeneralResult {
  public ok = true;
  public message = '';
  public result: any;

  constructor(ok = true, message = '') {
    this.ok = ok;
    this.message = message;
  }
}
