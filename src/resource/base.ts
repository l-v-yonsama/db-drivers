import ShortUniqueId from 'short-unique-id';
import { DbResourceCapabilities, ResourceType } from '../types';
import type { AllSubDbResource } from './types';

const uid = new ShortUniqueId();

export abstract class DbResource<T extends DbResource = AllSubDbResource> {
  public readonly id = uid.randomUUID(8);
  public readonly resourceType: ResourceType;
  public readonly name: string;
  public comment?: string;
  public readonly children: Array<T>;
  public meta: { [key: string]: any };
  public capabilities?: DbResourceCapabilities;
  public isInProgress?: boolean;

  constructor(resourceType: ResourceType, name: string) {
    this.resourceType = resourceType;
    this.name = name;
    this.children = [];
  }

  getProperties(): { [key: string]: any } {
    return {
      name: this.name,
      comment: this.comment,
    };
  }

  addChild(res: T): T {
    this.children.push(res);
    return res;
  }

  hasChildren(): boolean {
    return this.children.length > 0;
  }

  clearChildren(): void {
    this.children.splice(0, this.children.length);
  }

  getChildByName(name: string, insensitive?: boolean): T | undefined {
    if (insensitive === true) {
      const uname = name.toUpperCase();
      return this.children.find((it) => it.name.toUpperCase() == uname);
    }
    return this.children.find((it) => it.name == name);
  }

  findChildren<U extends DbResource = AllSubDbResource>({
    keyword,
    resourceType,
    recursively,
  }: {
    resourceType: ResourceType;
    keyword?: string | RegExp;
    recursively?: boolean;
  }): U[] {
    if (this.children.some((it) => it.resourceType === resourceType)) {
      const children2 = this.children.filter(
        (it) => it.resourceType === resourceType,
      );
      if (keyword == undefined) {
        return (children2 ?? []) as unknown[] as U[];
      }
      if (typeof keyword === 'string') {
        const k = keyword.toUpperCase();
        return (children2.filter((it) => it.name.toUpperCase() == k) ??
          []) as unknown[] as U[];
      }
      return (children2.filter((it) => keyword.test(it.name)) ??
        []) as unknown[] as U[];
    }
    if (recursively === true) {
      const ret: U[] = [];
      this.children.forEach((it) => {
        ret.push(
          ...(it.findChildren({
            keyword,
            resourceType,
            recursively,
          }) as unknown[] as U[]),
        );
      });
      return ret;
    }
    return [];
  }

  toString(): string {
    return `[${this.resourceType}]:${this.name}`;
  }
  toJsonStringify(space = 0): string {
    return JSON.stringify(
      this,
      (k, v) => {
        if (['disabled'].includes(k)) {
          return undefined;
        }
        return v;
      },
      space,
    );
  }
}
