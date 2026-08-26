export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-bk-dark-card py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} BK Streaming. Tous droits réservés.</p>
        <p className="mt-1">Votre univers vidéo privé. Sécurisé. Moderne. Pensé pour vous.</p>
      </div>
    </footer>
  );
}
