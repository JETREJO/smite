import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ItemNotFound() {
  return (
    <EmptyState
      title="Este item no existe"
      description="Puede que se haya escrito mal la dirección o que el item ya no esté registrado."
      action={<ButtonLink href="/items">Ver todos los items</ButtonLink>}
    />
  );
}
