"use client"

import { CheckIcon, IconChevronDown } from "../../../components/ui/icons"
import { ChevronRight } from "lucide-react"
import { Button } from "../../../components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover"
import { cn } from "../../../lib/utils"
import { useAtom } from "jotai"
import { useMemo, useState } from "react"
import { trpc } from "../../../lib/trpc"
import {
  selectedCustomProviderIdByAgentAtom,
  selectedGatewayModelByAgentAtom,
  type CustomProviderAgentId,
} from "../atoms"

/**
 * US-026 + US-027: per-agent "Gateway" picker. Two-tier selection:
 *
 * Tier 1: Gateway (the endpoint) — routes traffic through a custom
 *   OpenAI/Anthropic-compatible provider from Preferences → Custom
 *   Providers. "Default" = no customProviderId in subscription input.
 *
 * Tier 2: Model (the per-gateway discovered model) — shown as a
 *   sub-list when a gateway is selected. Persists per (agent, gateway).
 *   When set, the model string is passed verbatim in the chat run.
 *
 * Only enabled providers are listed. Disabled providers stay in the DB
 * but won't be selectable. Picker auto-hides when no compatible
 * providers are configured.
 */
type GatewayPickerProps = {
  agentId: CustomProviderAgentId
  disabled?: boolean
}

export function GatewayPicker({ agentId, disabled }: GatewayPickerProps) {
  const [byAgent, setByAgent] = useAtom(selectedCustomProviderIdByAgentAtom)
  const [modelByAgent, setModelByAgent] = useAtom(
    selectedGatewayModelByAgentAtom,
  )
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
  const selectedProvider = useMemo(
    () => usable.find((p) => p.id === selectedId) ?? null,
    [usable, selectedId],
  )
  const selectedModel =
    (selectedId ? modelByAgent[agentId]?.[selectedId] : null) ?? null

  // Two-tier popover state: null = top-level (gateway list), providerId
  // = drilled into that gateway's model list.
  const [openTier, setOpenTier] = useState<null | string>(null)

  if (disabled || usable.length === 0) return null

  const setSelected = (id: string | null) => {
    setByAgent((prev) => ({ ...prev, [agentId]: id }))
    // Reset drilled tier when gateway changes so the popover returns
    // to the top-level list.
    setOpenTier(null)
  }

  const setSelectedModel = (modelName: string | null) => {
    if (!selectedId) return
    setModelByAgent((prev) => ({
      ...prev,
      [agentId]: { ...(prev[agentId] ?? {}), [selectedId]: modelName },
    }))
  }

  const triggerLabel = selectedProvider
    ? selectedModel
      ? `${selectedProvider.name} · ${selectedModel}`
      : selectedProvider.name
    : "Default"

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) setOpenTier(null)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-7 max-w-[280px] gap-1 truncate rounded-md border-border/60 bg-background/40 px-2 text-xs font-normal",
            "hover:bg-background/80",
          )}
          data-testid={`gateway-picker-${agentId}`}
          title={
            selectedProvider
              ? selectedModel
                ? `Routing through ${selectedProvider.name} → ${selectedModel}`
                : `Routing through ${selectedProvider.name}`
              : "Using default upstream"
          }
        >
          <span className="text-muted-foreground">Gateway:</span>
          <span className="truncate font-medium">{triggerLabel}</span>
          <IconChevronDown className="h-3 w-3 flex-shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1" sideOffset={4}>
        {openTier === null && (
          <TopLevel
            usable={usable}
            selectedId={selectedId}
            onSelect={setSelected}
            onDrillInto={(id) => setOpenTier(id)}
            agentId={agentId}
          />
        )}
        {openTier !== null && (
          <ModelLevel
            provider={usable.find((p) => p.id === openTier)!}
            selectedModel={
              (modelByAgent[agentId]?.[openTier] as string | null | undefined) ??
              null
            }
            onSelectModel={setSelectedModel}
            onBack={() => setOpenTier(null)}
            onDrillInto={setOpenTier}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

type ProviderLite = {
  id: string
  name: string
  baseUrl: string
  models: string[]
}

function TopLevel({
  usable,
  selectedId,
  onSelect,
  onDrillInto,
  agentId,
}: {
  usable: ProviderLite[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onDrillInto: (id: string) => void
  agentId: CustomProviderAgentId
}) {
  return (
    <>
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        Route through custom provider
      </div>
      <button
        type="button"
        onClick={() => onSelect(null)}
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
        <div
          key={p.id}
          className={cn(
            "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm",
            "hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(p.id)}
            className="flex flex-1 flex-col"
          >
            <div className="flex items-center gap-2">
              <span>{p.name}</span>
              {selectedId === p.id && (
                <CheckIcon className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {p.baseUrl}
              {p.models.length > 0 && ` · ${p.models.length} models`}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onDrillInto(p.id)}
            className={cn(
              "ml-2 rounded-sm p-1",
              "hover:bg-background/80",
            )}
            title="Pick a model from this gateway"
            aria-label={`Browse ${p.name} models`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {usable.length === 0 && (
        <div className="px-2 py-3 text-xs text-muted-foreground">
          No {agentId === "claude-code" ? "anthropic" : "openai"}-compatible
          providers configured. Add one in Preferences → Custom Providers.
        </div>
      )}
    </>
  )
}

function ModelLevel({
  provider,
  selectedModel,
  onSelectModel,
  onBack,
}: {
  provider: ProviderLite
  selectedModel: string | null
  onSelectModel: (modelName: string | null) => void
  onBack: () => void
  onDrillInto: (id: string) => void
}) {
  return (
    <>
      <div className="mb-1 flex items-center gap-1">
        <button
          type="button"
          onClick={onBack}
          className="rounded-sm px-1 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          ← Back
        </button>
        <span className="px-1 text-xs font-medium">{provider.name}</span>
      </div>
      <button
        type="button"
        onClick={() => onSelectModel(null)}
        className={cn(
          "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm",
          "hover:bg-accent hover:text-accent-foreground",
        )}
        title="Use the chat's default model selector"
      >
        <span>Default model</span>
        {selectedModel === null && (
          <CheckIcon className="h-3.5 w-3.5 text-primary" />
        )}
      </button>
      {provider.models.length === 0 ? (
        <div className="px-2 py-3 text-xs text-muted-foreground">
          No discovered models yet. Click Test in Preferences → Custom
          Providers to probe this gateway.
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto">
          {provider.models.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onSelectModel(m)}
              className={cn(
                "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm",
                "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <span className="truncate font-mono text-xs">{m}</span>
              {selectedModel === m && (
                <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
