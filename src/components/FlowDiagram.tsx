import React from 'react';

interface FlowDiagramProps {
  nodes: string[];
  ariaLabel: string;
}

export function FlowDiagram({ nodes, ariaLabel }: FlowDiagramProps) {
  return (
    <div className="@container w-full mt-6">
      <div
        role="img"
        aria-label={ariaLabel}
        className="w-full flex flex-col @[520px]:flex-row items-stretch @[520px]:items-center gap-2 @[520px]:gap-0"
      >
        {nodes.map((node, index) => {
          const isLast = index === nodes.length - 1;
          return (
            <React.Fragment key={node}>
              <div className="rounded-md border border-navy bg-paper px-[14px] py-[10px] text-center shrink-0">
                <span className="t-diagram font-medium">{node}</span>
              </div>

              {!isLast && (
                <>
                  {/* Horizontal connector (parent container >= 520px) */}
                  <div
                    className="hidden @[520px]:flex flex-1 items-center min-w-[12px] px-1"
                    aria-hidden="true"
                  >
                    <div className="h-[2px] w-full bg-navy relative">
                      <svg
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[2px]"
                        width="6"
                        height="8"
                        viewBox="0 0 6 8"
                        fill="none"
                      >
                        <path d="M0 0L6 4L0 8V0Z" fill="var(--navy)" />
                      </svg>
                    </div>
                  </div>

                  {/* Vertical connector (parent container < 520px) */}
                  <div
                    className="flex @[520px]:hidden justify-center items-center h-[20px]"
                    aria-hidden="true"
                  >
                    <div className="w-[2px] h-full bg-navy relative">
                      <svg
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[2px]"
                        width="8"
                        height="6"
                        viewBox="0 0 8 6"
                        fill="none"
                      >
                        <path d="M0 0L4 6L8 0H0Z" fill="var(--navy)" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}