type RequestCardSkeletonGridProps = {
  label: string;
  actionCount?: 1 | 2;
};

export function RequestCardSkeletonGrid({ label, actionCount = 2 }: RequestCardSkeletonGridProps) {
  return (
    <div role="status" className="grid gap-3 sm:grid-cols-3 sm:gap-5 2xl:grid-cols-4">
      <span className="sr-only">{label}</span>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="glass flex animate-pulse flex-col overflow-hidden rounded-2xl border bg-white/60 p-2.5 motion-reduce:animate-none sm:rounded-[2rem] sm:p-3"
        >
          <div className="aspect-video w-full rounded-xl border-2 border-white bg-muted shadow-sm ring-1 ring-primary/25 sm:aspect-[4/3] sm:rounded-3xl" />
          <div className="flex-1 space-y-2 px-2 pt-3 sm:space-y-2.5 sm:px-3 sm:pt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="h-5 w-2/5 rounded bg-muted sm:h-6" />
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
            <div className="flex min-h-8 flex-col justify-center gap-2 sm:min-h-10">
              <div className="h-3 w-full rounded bg-muted sm:h-3.5" />
              <div className="h-3 w-2/3 rounded bg-muted sm:h-3.5" />
            </div>
            <div className="flex gap-1.5">
              <div className="h-6 w-14 rounded-full bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-12 rounded-full bg-muted" />
            </div>
          </div>
          <div className="flex gap-2 px-2 pt-3 pb-1 sm:px-3 sm:pt-4 sm:pb-2">
            {Array.from({ length: actionCount }, (_, actionIndex) => (
              <div key={actionIndex} className="h-10 flex-1 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
