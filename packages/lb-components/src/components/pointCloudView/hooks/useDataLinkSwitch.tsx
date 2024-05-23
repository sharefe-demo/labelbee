import React, {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { useLatest } from 'ahooks'

import { PointCloudContext } from '../PointCloudContext';
import LinkIcon from '@/assets/annotation/icon_link.svg';
import UnlinkIcon from '@/assets/annotation/icon_unlink.svg';
import { IPointCloudBoxList, IPointCloudBoxRect } from '@labelbee/lb-utils';

const iconSize = { width: 16, height: 16 };

export interface UseDataLinkSwitchOptions {
  /** DOM显示层级 */
  zIndex: number;

  /** 是否2d框 */
  is2DView: boolean;

  /**
   * 用来判断图片项,
   * 具体参考：packages/lb-components/src/components/pointCloud2DRectOperationView/index.tsx, getRectListByBoxList函数
   *
   * 基于上参考，此值需确保唯一性！
   */
  imageName: string;
}

enum ActionType {
  none,
  add,
  delete,
}

const useDataLinkSwitch = (opts: UseDataLinkSwitchOptions) => {
  if (!opts.imageName) {
    console.warn('missing imageName');
  }

  const imageNameRef = useRef(opts.imageName);
  imageNameRef.current = opts.imageName;

  const {
    unlinkImageItems,
    setUnlinkImageItems,

    addRectFromPointCloudBoxByImageName,
    removeRectByPointCloudBoxId,
  } = useContext(PointCloudContext);

  const addRect = useLatest(addRectFromPointCloudBoxByImageName)
  const removeRect = useLatest(removeRectByPointCloudBoxId)

  /** 连接 或 断开连接 */
  const isLinking = useMemo(() => {
    if (!opts.is2DView) return true;

    const set = new Set(unlinkImageItems);

    return set.has(imageNameRef.current) === false;
  }, [opts.is2DView, unlinkImageItems]);

  const flushUnlinkImageItems = useCallback<
    (imageName: string, forceTargetIsLinking?: boolean) => ActionType
  >((targetImageName, forceTargetIsLinking) => {
    let at: ActionType = ActionType.none;

    setUnlinkImageItems((prev) => {
      const set = new Set(prev);
      const imageName = targetImageName;

      at = ActionType.none;

      if (forceTargetIsLinking !== undefined) {
        if (forceTargetIsLinking && !set.has(imageName)) {
          set.add(imageName);
          at = ActionType.add;
        } else if (!forceTargetIsLinking && set.has(imageName)) {
          set.delete(imageName);
          at = ActionType.delete;
        }
      } else {
        if (set.has(imageName)) {
          set.delete(imageName);
          at = ActionType.delete;
        } else {
          set.add(imageName);
          at = ActionType.add;
        }
      }

      if (at !== ActionType.none) return [...set.values()];
      return prev;
    });

    return at;
  }, []);

  const setIsLinking = useCallback<Dispatch<SetStateAction<boolean>>>(
    (fn) => {
      let targetValue = false;

      if (typeof fn === 'function') {
        targetValue = fn(isLinking);
      } else {
        targetValue = fn;
      }

      flushUnlinkImageItems(imageNameRef.current, !targetValue);
    },
    [setUnlinkImageItems, isLinking],
  );

  const handleSwitch = useCallback(() => {
    setIsLinking((b) => !b);
  }, [setIsLinking]);

  const rendered = useMemo(() => {
    const is2DView = opts.is2DView;
    if (!is2DView) {
      return null;
    }

    const zIndex = opts.zIndex ?? 999;
    const style: CSSProperties = {
      zIndex,
      position: 'absolute',
      top: 16,
      right: 16 + 28 + 12 /* {the right sibling boundary} + {gap} */,
      background: 'rgba(0, 0, 0, 0.74)',
      color: 'white',
      borderRadius: 2,
      padding: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      cursor: 'pointer',
    };

    return (
      <div style={style} onClick={handleSwitch}>
        {isLinking && <img src={LinkIcon} style={iconSize} />}
        {!isLinking && <img src={UnlinkIcon} style={iconSize} />}
      </div>
    );
  }, [isLinking, opts.is2DView, opts.zIndex, handleSwitch]);

  useEffect(() => {
    if (!opts.is2DView) {
      return;
    }

    const imageName = imageNameRef.current;
    if (isLinking) {
      removeRect.current(imageName);
    } else {
      addRect.current(imageName);
    }
  }, [isLinking, opts.is2DView]);

  return {
    rendered,
    isLinking,
  };
};

export default useDataLinkSwitch;
