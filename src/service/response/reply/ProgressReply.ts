import GeneralReply from './GeneralReply';

export default class ProgressReply extends GeneralReply {
  public source: string;
  public progress: number;
  public options?: any;

  constructor(source: string, message: string, progress: number, options?: any) {
    super(true, message);
    this.source = source;
    this.progress = progress;
    this.options = options;
  }
}
