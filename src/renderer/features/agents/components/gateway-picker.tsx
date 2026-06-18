"use client"

import { CheckIcon, IconChevronDown } from "../../../components/ui/icons"
import { Button } from "../../../components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover"
import { cn } from "../../../lib/utils"
import { useAtom } from "jotai"
import { useMemo } from "react"
import { trpc } from "../../../lib/trpc"
import {
  selectedCustomProviderIdByAgentAtom,
  type CustomProviderAgentId,
} from "../atoms"

/**
 * US-026: per-agent "Gateway" picker for routing chat runs through a
 * custom OpenAI/Anthropic-compatible provider from the custom_providers
 * table (Preferences → Custom Providers). Shows in the chat header
 * next to the model selector. Selecting "Default" passes no
 * customProviderId, so the chat uses the bundled CLI's default upstream.
 *
 * Only enabled providers are listed. Disabled providers stay in the DB
 * but won't be selectable.
 */
type GatewayPickerProps = {
  agentId: CustomProviderAgentId
  /** When the agent type does not match any custom provider type, render nothing. */
  disabled?: boolean
}

export function GatewayPicker({ agentId, disabled }: GatewayPickerProps) {
  const [byAgent, setByAgent] = useAtom(selectedCustomProviderIdByAgentAtom)
  const { data: providers } = trpc.customProviders.list.useQuery(undefined, {
    enabled: !disabled,
  })

  const expectedType: "anthropic" | "openai" =
    agentId === "claude-code" ? "anthropic" : "openai"

  const usable = useMemo(
    () =>
      (providers ?? []).filter(
        (p) => p.enabled && p.type === expectedType,
      ),
    [providers, expectedType],
  )

  const selectedId = byAgent[agentId]
  const selected = useMemo(
    () => usable.find((p) => p.id === selectedId) ?? null,
    [usable, selectedId],
  )

  // Hide entirely if no providers of the right type are configured —
  // keeps the chat header clean for users who don't use gateways.
  if (disabled || usable.length === 0) return null

  const setSelected = (id: string | null) => {
    setByAgent((prev) => ({ ...prev, [agentId]: id }))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-7 gap-1 rounded-md border-border/60 bg-background/40 px-2 text-xs font-normal",
            "hover:bg-background/80",
          )}
          data-testid={`gateway-picker-${agentId}`}
          title={
            selected
              ? `Routing through ${selected.name}`
              : "Using default upstream"
          }
        >
          <span className="text-muted-foreground">Gateway:</span>
          <span className="font-medium">
            {selected ? selected.name : "Default"}
          </span>
          <IconChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 p-1"
        sideOffset={4}
      >
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Route through custom provider
        </div>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className={cn(
            "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm",
            "hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <span>Default</span>
          {selectedId === null && (
            <CheckIcon className="h-3.5 w-3.5 text-primary" />
          )}
        </button>
        {usable.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm",
              "hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <div className="flex flex-col">
              <span>{p.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {p.baseUrl}
              </span>
            </div>
            {selectedId === p.id && (
              <CheckIcon className="h-3.5 w-3.5 text-primary" />
            )}
          </button>
        ))}
        {usable.length === 0 && (
          <div className="px-2 py-3 text-xs text-muted-foreground">
            No {expectedType}-compatible providers configured. Add one in
            Preferences → Custom Providers.
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
