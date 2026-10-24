"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { ABILITY_RANK_COUNT, LEVELABLE_SLOTS, MAX_GOD_LEVEL } from "@/helpers/ability-slots";
import type { BuildInput } from "@/interfaces/build.interface";

interface SkillOrderGridProps {
  abilities: { slot: number; name: string }[];
}

const LEVELS = Array.from({ length: MAX_GOD_LEVEL }, (_, index) => index + 1);

/** Grid of abilities × levels: click a cell to level that ability at that level. */
export function SkillOrderGrid({ abilities }: SkillOrderGridProps) {
  const { control, setValue } = useFormContext<BuildInput>();
  const skillOrder = useWatch({ control, name: "skillOrder" });

  function rankCount(slot: number): number {
    return skillOrder.filter((level) => level.slot === slot).length;
  }

  function toggle(levelIndex: number, slot: number) {
    const current = skillOrder[levelIndex]?.slot;
    setValue(`skillOrder.${levelIndex}.slot`, current === slot ? null : slot, { shouldDirty: true });
  }

  function clearAll() {
    LEVELS.forEach((_, index) => setValue(`skillOrder.${index}.slot`, null, { shouldDirty: true }));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-fg-muted">
                Habilidad
              </th>
              {LEVELS.map((level) => (
                <th key={level} scope="col" className="w-8 py-2 text-center text-xs font-semibold tabular-nums text-fg-muted">
                  {level}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEVELABLE_SLOTS.map((slot) => {
              const name = abilities.find((ability) => ability.slot === slot)?.name ?? `Habilidad ${slot}`;
              const ranks = rankCount(slot);
              return (
                <tr key={slot} className="border-b border-line last:border-b-0">
                  <th scope="row" className="px-3 py-1.5 text-left font-normal">
                    <span className="block font-medium">
                      {slot}. {name}
                    </span>
                    <span className="text-xs tabular-nums text-fg-subtle">
                      {ranks}/{ABILITY_RANK_COUNT}
                    </span>
                  </th>
                  {LEVELS.map((level, levelIndex) => {
                    const isSelected = skillOrder[levelIndex]?.slot === slot;
                    const isFull = !isSelected && ranks >= ABILITY_RANK_COUNT;
                    return (
                      <td key={level} className="p-0.5 text-center">
                        <button
                          type="button"
                          aria-label={`Nivel ${level}: ${name}`}
                          aria-pressed={isSelected}
                          disabled={isFull}
                          onClick={() => toggle(levelIndex, slot)}
                          className={
                            "h-8 w-8 rounded-md text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-30 " +
                            (isSelected
                              ? "bg-accent text-on-accent"
                              : "bg-elevated text-fg-subtle hover:bg-line-strong hover:text-fg")
                          }
                        >
                          {isSelected ? slot : ""}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-fg-subtle">
          Opcional. Cada nivel sube una habilidad; cada habilidad llega hasta rango {ABILITY_RANK_COUNT}.
        </p>
        <Button variant="ghost" onClick={clearAll}>
          Limpiar orden
        </Button>
      </div>
    </div>
  );
}
