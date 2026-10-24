import { ButtonLink } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <section className="flex flex-col items-start gap-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">SMITE 2</p>
      <h1 className="text-4xl font-bold sm:text-5xl">¡Hola! Bienvenido a tu base de builds.</h1>
      <p className="max-w-2xl text-lg text-fg-muted">
        Registra dioses e items, consulta sus stats y el escalado de sus habilidades, y arma builds personalizadas
        para cada dios.
      </p>
      <ButtonLink href="/gods/new" className="px-6 py-3 text-base">
        Registrar dios
      </ButtonLink>
    </section>
  );
}
