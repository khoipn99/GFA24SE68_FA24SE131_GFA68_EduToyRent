import React from "react";

const CardDataStats = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  children,
}) => {
  return (
    <div className="rounded-lg border bg-white py-4 px-5 shadow-md hover:shadow-lg transition-shadow duration-200 dark:border-gray-700 dark:bg-gray-800">
      {/* Icon Section */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500">
        {children}
      </div>

      {/* Content Section */}
      <div className="mt-3 flex items-center justify-between">
        {/* Title & Total */}
        <div>
          <h4 className="text-lg font-bold text-gray-800 dark:text-white">
            {total}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-300">{title}</p>
        </div>

        {/* Rate Section */}
        {/* <div className="flex items-center gap-1 text-sm font-semibold">
          {rate}

         
          {levelUp && (
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 9.5L8 4l5 5 5-5 4 4-5 5-5-5-5 5z" />
              </svg>
            </div>
          )}

        
          {levelDown && (
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 10.5L8 15l5-5 5 5 4-4-5-5-5 5-5-5-5 5z" />
              </svg>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default CardDataStats;
