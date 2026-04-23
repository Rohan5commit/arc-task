export default function DashboardLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-6 py-8 lg:px-8">
      <div className="space-y-6">
        <div className="h-28 animate-pulse rounded-3xl bg-white/6" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/6" />
          ))}
        </div>
        <div className="h-[520px] animate-pulse rounded-3xl bg-white/6" />
      </div>
    </main>
  );
}
