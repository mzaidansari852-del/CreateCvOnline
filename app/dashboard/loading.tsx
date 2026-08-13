import { Skeleton } from '@/components/ui/feedback';

/**
 * The overview, in outline.
 *
 * Mirrors the real layout — top bar, left rail, four stat tiles, three CV cards — so the
 * page does not jump when the content arrives. Static markup only: a loading state that
 * ships JavaScript defeats the point of having one.
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-dvh bg-ink-50">
      <div className="sticky top-0 z-70 border-b border-ink-200 bg-white">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="hidden h-4 w-32 sm:block" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px]">
        <div className="hidden w-60 shrink-0 border-r border-ink-200 bg-white px-3 py-5 lg:block">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-9 rounded-lg" />
            ))}
          </div>
          <Skeleton className="mt-6 h-28 rounded-xl" />
        </div>

        <div className="min-w-0 flex-1 px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pb-12">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2.5 h-4 w-80 max-w-full" />

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="rounded-xl border border-ink-200 bg-white p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-3 h-7 w-16" />
                <Skeleton className="mt-3 h-2 rounded-full" />
              </div>
            ))}
          </div>

          <Skeleton className="mt-6 h-24 rounded-xl" />

          <div className="mt-6">
            <Skeleton className="h-5 w-40" />
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="rounded-xl border border-ink-200 bg-white p-4">
                  <Skeleton className="aspect-[1.3/1] w-full rounded-lg" />
                  <Skeleton className="mt-4 h-4 w-3/5" />
                  <Skeleton className="mt-2 h-3 w-2/5" />
                  <Skeleton className="mt-4 h-2 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only" role="status">
        Loading your dashboard…
      </span>
    </div>
  );
}
