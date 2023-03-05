import * as path from 'path';
import GeneralReply from './GeneralReply';

export default class FileProcessResult extends GeneralReply {
  public extension = '';
  public file_url?: string;
  public file_path?: string;
  public file_name = '';
  public data?: string | Buffer;

  constructor(ok: boolean, message: string, options: {
    file_path?: string,
    file_url?: string,
    data?: string | Buffer
  }) {
    super(ok, message);
    if (options.file_path) {
      this.file_path = options.file_path;
      this.file_name = path.basename(options.file_path);
    }
    if (options.file_url) {
      this.file_url = options.file_url;
      this.file_name = path.basename(options.file_url);
    }
    const dot = this.file_name.lastIndexOf(".");
    if (dot >= 0) {
      this.extension = this.file_name.substring(dot + 1);
    }
    if (options.data) {
      this.data = options.data;
    }
  }
}
