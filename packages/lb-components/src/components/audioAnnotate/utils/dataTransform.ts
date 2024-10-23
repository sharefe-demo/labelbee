/**
 * @file Process audio tool data
 * @author lixinghua <lixinghua_vendor@sensetime.com>
 * @date 2024.05.14
 */

import { IAudioTimeSlice, ITextConfigItem } from '@labelbee/lb-utils';
import _ from 'lodash';

function traverseObject(obj: any, callback: (key: any, value: any, item: any) => void) {
  if (typeof obj === 'object' && obj !== null) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        callback(key, obj[key], obj);
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverseObject(obj[key], callback);
        }
      }
    }
  }
}

export default class AudioDataTransform {
  // clip tool get text by config
  public static getClipTextByConfig = (
    region: IAudioTimeSlice,
    clipTextList: ITextConfigItem[],
    isDefault = false,
  ) => {
    const newRegion = _.cloneDeep(region);
    clipTextList.forEach((i, index) => {
      // index === 0: Compatible with old data
      const defaultValue = i?.default ?? '';
      if (index === 0) {
        Object.assign(newRegion, { text: isDefault ? defaultValue : region[i.key] });
      } else {
        Object.assign(newRegion, { [i.key]: isDefault ? defaultValue : region[i.key] });
      }
    });
    return newRegion;
  };

  public static fixData = (data: any) => {
    const result: any = {};

    // 只保留一个值的 key
    const uniqueKeys = ['id', 'sourceID'];
    // 需要合并的数组或对象的 key
    const needMergeKeys = ['value', 'tag', 'regions'];
    // number类型的key
    const needAddKeys = ['preDiffCount'];

    traverseObject(data, (key, value) => {
      if (uniqueKeys.includes(key) && !result[key]) {
        result[key] = value;
        return;
      }
      if (needMergeKeys.includes(key)) {
        if (Array.isArray(value)) {
          result[key] = [...(result[key] ?? []), ...value]?.filter(
            ({ id, start, end }) => id && start >= 0 && end >= 0,
          );
          return;
        }
        result[key] = { ...(result[key] ?? {}), ...value };
        return;
      }
      if (needAddKeys.includes(key) && value >= 0) {
        result[key] = value;
        return;
      }
    });
    return result;
  };
}
