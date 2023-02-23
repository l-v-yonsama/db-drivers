export default class GeneralResponse {
  public ok = true;
  public message = '';
  public result: any;

  constructor(ok = true, message = '') {
    this.ok = ok;
    this.message = message;
  }
}
