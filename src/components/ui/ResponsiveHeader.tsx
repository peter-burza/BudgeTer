import React from 'react'

interface ResponsiveHeaderProps {
  label: string
  iconClass?: string
  symbol?: string
  screenWidth: number
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ label, iconClass, symbol, screenWidth }) => {
  const iconHeader = iconClass !== undefined ?
    <i className={`fa-solid ${iconClass} text-base`}></i>
    : <span className='text-[18px]'>{symbol}</span>

  const header = (iconClass === undefined && symbol === undefined) ?
    label :
    (screenWidth > 600 ? label : iconHeader)

  return (
    <>
      {header}
    </>
  );
};

export default ResponsiveHeader
