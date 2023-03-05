import ShortUniqueId from 'short-unique-id';
import { OutputType } from './types/OutputType';
import GeneralReply from './GeneralReply';

const uid = new ShortUniqueId();

export default class OutputReply extends GeneralReply {
  public output_type: OutputType;
  public request_id: string;
  public label: string;
  public content: any;

  constructor(output_type: OutputType, label: string, content: any) {
    super(true, '');
    this.output_type = output_type;
    this.request_id = uid.randomUUID(6);
    this.label = label;
    this.content = content;
  }
}
