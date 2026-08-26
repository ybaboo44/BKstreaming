export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bk-dark px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-bk-red font-bold text-white text-xl">
            BK
          </div>
          <h1 className="mt-4 text-2xl font-bold">BK Streaming</h1>
          <p className="mt-1 text-sm text-muted-foreground">Votre univers vidéo privé</p>
        </div>
        {children}
      </div>
    </div>
  );
}
