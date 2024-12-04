import React from "react";
import SectionSvg from "../assets/svg/SectionSvg";

const Section = ({
  className = "", // Default value for className
  id,
  crosses = false, // Default value for crosses
  crossesOffset = "", // Default value for crossesOffset
  custompaddings = "", // Default value for custom paddings
  children, // Corrected prop name
}) => {
  return (
    <div
      id={id}
      className={`relative ${
        custompaddings ||
        `py-10 lg:py-16 xl:py-20 ${crosses ? "lg:py-32 xl:py-40" : ""}`
      } ${className}`} // Correctly concatenated classNames
    >
      {children}

      {/* Left Border */}
      <div className="hidden absolute top-0 left-5 w-0.25 h-full bg-stroke-1 pointer-events-none md:block lg:left-7.5 xl:left-10" />

      {/* Right Border */}
      <div className="hidden absolute top-0 right-5 w-0.25 h-full bg-stroke-1 pointer-events-none md:block lg:right-7.5 xl:right-10" />

      {crosses && (
        <>
          {/* Crosses Top/Bottom */}
          <div
            className={`hidden absolute top-0 left-7.5 right-7.5 h-0.25 bg-stroke-1 ${crossesOffset} pointer-events-none lg:block xl:left-10 xl:right-10`}
          />

          {/* Render SVG */}
          <SectionSvg crossesOffset={crossesOffset} />
        </>
      )}
    </div>
  );
};

export default Section;
