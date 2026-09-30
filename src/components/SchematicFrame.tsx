import React from 'react';
import Image from 'next/image';

export type SchematicVariant =
  | 'page'
  | 'editor'
  | 'dashboard'
  | 'member'
  | 'form'
  | 'email'
  | 'login'
  | 'gallery'
  | 'idcard';

interface SchematicFrameProps {
  variant: SchematicVariant;
  caption?: string;
  imageSrc: string | null;
  alt: string;
  className?: string;
}

export function SchematicFrame({
  variant,
  caption,
  imageSrc,
  alt,
  className = '',
}: SchematicFrameProps) {
  return (
    <div
      className={`relative w-full aspect-[16/10] rounded-md border border-mist bg-surface overflow-hidden ${className}`}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover object-top"
          sizes="(min-width: 1024px) 66vw, 100vw"
          priority={false}
        />
      ) : (
        <div className="relative w-full h-full p-4 sm:p-6 flex flex-col justify-between select-none">
          <div className="w-full h-full">
            {variant === 'page' && (
              <div className="flex flex-col gap-3 h-full">
                <div className="flex items-center justify-between pb-2 border-b border-mist">
                  <div className="w-12 h-3 rounded-sm bg-silver opacity-40" />
                  <div className="flex gap-2">
                    <div className="w-6 h-2 rounded-full bg-mist" />
                    <div className="w-6 h-2 rounded-full bg-mist" />
                    <div className="w-6 h-2 rounded-full bg-mist" />
                    <div className="w-6 h-2 rounded-full bg-mist" />
                  </div>
                </div>
                <div className="py-2 flex flex-col gap-2">
                  <div className="w-3/5 h-4 rounded-sm bg-silver opacity-40" />
                  <div className="w-2/5 h-4 rounded-sm bg-silver opacity-40" />
                  <div className="w-16 h-4 rounded-sm bg-mist mt-1" />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-auto">
                  <div className="h-14 rounded-sm bg-mist" />
                  <div className="h-14 rounded-sm bg-mist" />
                  <div className="h-14 rounded-sm bg-mist" />
                </div>
              </div>
            )}

            {variant === 'editor' && (
              <div className="grid grid-cols-4 gap-3 h-full">
                <div className="col-span-1 border-r border-mist pr-2 flex flex-col gap-2">
                  <div className="w-full h-3 rounded-sm bg-mist" />
                  <div className="w-full h-3 rounded-sm bg-silver opacity-40" />
                  <div className="w-full h-3 rounded-sm bg-mist" />
                  <div className="w-full h-3 rounded-sm bg-mist" />
                  <div className="w-full h-3 rounded-sm bg-mist" />
                </div>
                <div className="col-span-3 flex flex-col gap-2">
                  <div className="w-full h-3 rounded-sm bg-mist mb-1" />
                  <div className="w-full h-2 rounded-sm bg-silver opacity-40" />
                  <div className="w-4/5 h-2 rounded-sm bg-silver opacity-40" />
                  <div className="w-full h-2 rounded-sm bg-silver opacity-40" />
                  <div className="w-3/4 h-2 rounded-sm bg-silver opacity-40" />
                  <div className="w-5/6 h-2 rounded-sm bg-silver opacity-40" />
                  <div className="w-2/3 h-2 rounded-sm bg-silver opacity-40" />
                  <div className="w-full h-12 rounded-sm bg-mist mt-auto" />
                </div>
              </div>
            )}

            {variant === 'dashboard' && (
              <div className="grid grid-cols-5 gap-3 h-full">
                <div className="col-span-1 border-r border-mist pr-2 flex flex-col gap-2">
                  <div className="w-full h-2 rounded-sm bg-silver opacity-40" />
                  <div className="w-full h-2 rounded-sm bg-mist" />
                  <div className="w-full h-2 rounded-sm bg-mist" />
                  <div className="w-full h-2 rounded-sm bg-mist" />
                  <div className="w-full h-2 rounded-sm bg-mist" />
                  <div className="w-full h-2 rounded-sm bg-mist" />
                </div>
                <div className="col-span-4 flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-8 rounded-sm bg-mist" />
                    <div className="h-8 rounded-sm bg-mist" />
                    <div className="h-8 rounded-sm bg-mist" />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <div className="w-full h-3 rounded-sm bg-silver opacity-40" />
                    <div className="w-full h-3 rounded-sm bg-mist" />
                    <div className="w-full h-3 rounded-sm bg-mist" />
                    <div className="w-full h-3 rounded-sm bg-mist" />
                    <div className="w-full h-3 rounded-sm bg-mist" />
                  </div>
                </div>
              </div>
            )}

            {variant === 'member' && (
              <div className="flex flex-col gap-3 h-full">
                <div className="w-full h-3 rounded-sm bg-silver opacity-40" />
                <div className="w-full h-8 rounded-sm bg-mist" />
                <div className="w-full h-8 rounded-sm bg-mist" />
                <div className="flex flex-col gap-1.5 mt-auto">
                  <div className="w-full h-3 rounded-sm bg-silver opacity-40" />
                  <div className="w-full h-3 rounded-sm bg-mist" />
                  <div className="w-full h-3 rounded-sm bg-mist" />
                  <div className="w-full h-3 rounded-sm bg-mist" />
                </div>
              </div>
            )}

            {variant === 'form' && (
              <div className="flex items-center justify-center h-full">
                <div className="w-4/5 max-w-[240px] p-3 rounded-sm border border-mist flex flex-col gap-2">
                  <div className="w-full h-3 rounded-sm bg-silver opacity-40" />
                  <div className="w-full h-3 rounded-sm bg-silver opacity-40" />
                  <div className="w-full h-3 rounded-sm bg-silver opacity-40" />
                  <div className="w-1/2 h-3 rounded-sm bg-mist mt-1" />
                </div>
              </div>
            )}

            {variant === 'email' && (
              <div className="flex flex-col gap-2 h-full border border-mist p-3 rounded-sm">
                <div className="w-1/3 h-2 rounded-sm bg-silver opacity-40" />
                <div className="w-1/2 h-2 rounded-sm bg-silver opacity-40" />
                <div className="w-2/5 h-2 rounded-sm bg-silver opacity-40 pb-2 border-b border-mist" />
                <div className="w-full h-2 rounded-sm bg-mist mt-1" />
                <div className="w-full h-2 rounded-sm bg-mist" />
                <div className="w-4/5 h-2 rounded-sm bg-mist" />
                <div className="w-full h-2 rounded-sm bg-mist" />
                <div className="w-3/4 h-2 rounded-sm bg-mist" />
                <div className="w-2/3 h-2 rounded-sm bg-mist" />
                <div className="w-16 h-4 rounded-sm bg-silver opacity-40 mt-auto" />
              </div>
            )}

            {variant === 'login' && (
              <div className="flex items-center justify-center h-full">
                <div className="w-3/4 max-w-[200px] p-4 rounded-sm border border-mist flex flex-col gap-2.5">
                  <div className="w-full h-3 rounded-sm bg-silver opacity-40" />
                  <div className="w-full h-3 rounded-sm bg-silver opacity-40" />
                  <div className="w-full h-4 rounded-sm bg-mist mt-1" />
                </div>
              </div>
            )}

            {variant === 'gallery' && (
              <div className="grid grid-cols-3 grid-rows-2 gap-2 h-full">
                <div className="rounded-sm bg-mist" />
                <div className="rounded-sm bg-silver opacity-40" />
                <div className="rounded-sm bg-mist" />
                <div className="rounded-sm bg-silver opacity-40" />
                <div className="rounded-sm bg-mist" />
                <div className="rounded-sm border border-mist flex items-center justify-center relative">
                  <div className="w-4 h-0.5 bg-silver absolute" />
                  <div className="w-0.5 h-4 bg-silver absolute" />
                </div>
              </div>
            )}

            {variant === 'idcard' && (
              <div className="flex items-center justify-center h-full">
                <div className="w-4/5 aspect-[1.586] p-3 rounded-sm border border-mist flex flex-col justify-between">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-sm bg-silver opacity-40 shrink-0" />
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="w-full h-2 rounded-sm bg-mist" />
                      <div className="w-4/5 h-2 rounded-sm bg-mist" />
                      <div className="w-1/2 h-2 rounded-sm bg-mist" />
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-sm bg-silver opacity-40" />
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-3 left-3">
            <span className="t-caption bg-sunken rounded-full px-3 py-1 text-slate border border-mist inline-block">
              Interface preview coming soon
            </span>
          </div>
        </div>
      )}
    </div>
  );
}