import React from "react";

const FullWidthWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`container mx-auto w-full px-4 pt-4 ${className}`}>
      {children}
    </div>
  );
};

export default FullWidthWrapper;
