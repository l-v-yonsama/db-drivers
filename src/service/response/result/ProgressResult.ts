import { GeneralResult } from './GeneralResult';

export class ProgressResult extends GeneralResult {
  public source: string;
  public progress: number;
  public options?: any;

  constructor(
    source: string,
    message: string,
    progress: number,
    options?: any,
  ) {
    super(true, message);
    this.source = source;
    this.progress = progress;
    this.options = options;
  }
}
