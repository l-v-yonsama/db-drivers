import ShortUniqueId from 'short-unique-id';
import { ResultSetDataHolder } from './ResultSetDataHolder';
import { AnnotationType } from '../types';

const uid = new ShortUniqueId();

export interface DocumentConvertOptions {
  progress_callback?: Function;
  write_page_number?: boolean;
  margin_of_baseline?: number;
  num_of_horizontal_divisions?: number;
  line_separator?: string;
  encoding?: string;
}
export interface LabeledRdh {
  label: string;
  id: string;
  rdh: ResultSetDataHolder;
}
export class MultipleResultSetDataHolder {
  public list: LabeledRdh[];
  public active_id?: string;
  public source_file_name?: string;

  public static createEmpty(): MultipleResultSetDataHolder {
    return new MultipleResultSetDataHolder();
  }

  public static from(obj: any): MultipleResultSetDataHolder {
    const r = new MultipleResultSetDataHolder();
    if (obj.active_id) {
      r.active_id = obj.active_id;
    }
    if (obj.list) {
      obj.list.forEach((lr: any) => {
        r.push(lr.label, ResultSetDataHolder.from(lr.rdh), lr.id);
      });
    }
    return r;
  }

  constructor() {
    this.list = new Array<LabeledRdh>();
  }
  public hasAnnotation(type: AnnotationType): boolean {
    let r = false;
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].rdh.hasAnnotation(type)) {
        r = true;
        break;
      }
    }
    return r;
  }
  public push(label: string, rdh: ResultSetDataHolder, id?: string): void {
    if (id === undefined || id === '') {
      id = uid.randomUUID(8);
    }
    this.list.push({ label, id, rdh });
  }
  public clear(): void {
    this.active_id = undefined;
    this.list.splice(0, this.list.length);
  }
  public getActiveData(): LabeledRdh | undefined {
    if (this.active_id) {
      return this.list.find((r) => r.id === this.active_id);
    }
    return undefined;
  }
  public moveFirstPosition(): void {
    this.movePosition('first');
  }
  public movePosition(position: string): void {
    if (this.list.length === 0) {
      return;
    }
    if (this.active_id) {
      const idx = this.list.findIndex((r) => r.id === this.active_id);
      if (idx < 0) {
        // not found.
        this.active_id = this.list[0].id;
      } else {
        switch (position.toLocaleLowerCase()) {
          case 'first':
            this.active_id = this.list[0].id;
            break;
          case 'prev':
            if (idx <= 0) {
              this.active_id = this.list[this.list.length - 1].id;
            } else {
              this.active_id = this.list[idx - 1].id;
            }
            break;
          case 'next':
            if (idx >= this.list.length - 1) {
              this.active_id = this.list[0].id;
            } else {
              this.active_id = this.list[idx + 1].id;
            }
            break;
          case 'last':
            this.active_id = this.list[this.list.length - 1].id;
            break;
        }
      }
    } else {
      this.active_id = this.list[0].id;
    }
  }
  public copyFrom(that: MultipleResultSetDataHolder): void {
    this.clear();
    if (that.active_id) {
      this.active_id = that.active_id;
    }
    that.list.forEach((t) => {
      this.list.push(t);
    });
  }
}
