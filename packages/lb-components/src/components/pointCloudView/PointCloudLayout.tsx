import { getClassName } from '@/utils/dom';
import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

export const PointCloudContainer: React.FC<PropsWithChildren<{
  title: string | React.ReactElement | null;
  toolbar?: React.ReactElement | null;
  className?: string;
  style?: React.CSSProperties;
  titleOnSurface?: boolean; // adherent surface
}>> = ({ title, toolbar, children, className, style, titleOnSurface }) => {
  return (
    <div className={classNames([className, getClassName('point-cloud-container')])} style={style}>
      {titleOnSurface ? (
        <span className={getClassName('point-cloud-container', 'header-title-box')}>{title}</span>
      ) : (
        <div className={getClassName('point-cloud-container', 'header')}>
          {title && (
            <span className={getClassName('point-cloud-container', 'header-title')}>{title}</span>
          )}

          {toolbar && (
            <div className={getClassName('point-cloud-container', 'header-toolbar')}>{toolbar}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
