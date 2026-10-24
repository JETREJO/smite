import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function GodNotFound() {
  return (
    <EmptyState
      title="Este dios no existe"
      description="Puede que se haya escrito mal la dirección o que el dios ya no esté registrado."
      action={<ButtonLink href="/">Ver todos los dioses</ButtonLink>}
    />
  );
}
