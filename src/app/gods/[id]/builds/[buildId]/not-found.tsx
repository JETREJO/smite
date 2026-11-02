import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function BuildNotFound() {
  return (
    <EmptyState
      title="Esta build no existe"
      description="Puede que se haya escrito mal la dirección o que la build ya no esté registrada."
      action={<ButtonLink href="/">Ver todos los dioses</ButtonLink>}
    />
  );
}
