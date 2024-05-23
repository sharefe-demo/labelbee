import { IFileItem } from '@/types/data';
import { EventBus } from '@labelbee/lb-annotation';
import { useLatest } from 'ahooks';
import { useContext, useEffect } from 'react';
import { PointCloudContext } from '../PointCloudContext';

const useCopyBackwardResult = (
  currentIndex: number
) => {
  const { setUnlinkImageItems } = useContext(PointCloudContext);

  useEffect(() => {
    const fn = (data: { currentData: IFileItem; currentIndex: number; list: IFileItem[] }) => {
      if (!data) {
        console.error('missing data');
        return;
      }

      const { currentData, currentIndex, list } = data;

      const prevData = list[currentIndex - 1] || null;
      if (!prevData) {
        return;
      }

      const getImageNames = (item: IFileItem) =>
        item.mappingImgList?.map((item) => {
          return item.path;
        });

      const prevImageNames = getImageNames(prevData);
      const imageNames = getImageNames(currentData);

      // No prev or current image names
      if (!imageNames || !prevImageNames) {
        return;
      }

      setUnlinkImageItems((items) => {
        const currentSet = new Set<string>(items);

        const unlinkSet = new Set<string>();
        const linkSet = new Set<string>();

        imageNames.forEach((imageName, idx) => {
          const prevImageName = prevImageNames[idx];

          if (currentSet.has(prevImageName)) {
            unlinkSet.add(imageName);
          } else {
            if (currentSet.has(imageName)) {
              currentSet.delete(imageName);
            } else {
              linkSet.add(imageName);
            }
          }
        });

        if (unlinkSet.size) {
          return [...currentSet, ...unlinkSet];
        }

        return [...currentSet];
      });
    };

    EventBus.on('copy:backward_result', fn);
    return () => {
      EventBus.unbind('copy:backward_result', fn);
    };
  }, []);
};

export default useCopyBackwardResult;
