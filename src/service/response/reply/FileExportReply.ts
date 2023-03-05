import ShortUniqueId from 'short-unique-id';
import GeneralReply from './GeneralReply';
import { FileExportType } from './types/FileExportType';

const uid = new ShortUniqueId();

export default class FileExportReply extends GeneralReply {
  public export_type: FileExportType;
  public request_id: string;
  public ok = true;
  public message = '';
  public target_path: string;

  constructor(export_type: FileExportType, target_path: string) {
    super(true, '');
    this.export_type = export_type;
    this.request_id = uid.randomUUID(6);
    this.target_path = target_path;
  }
}
